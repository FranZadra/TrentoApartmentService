const Contratto = require('../models/Contratto');
const Guasto = require('../models/Guasto');
const Appartamento = require('../models/Appartamento');
const User = require('../models/User');

const buildContrattoInquilinoFilter = (userId, extraFilter = {}) => ({
    ...extraFilter,
    $or: [
        { idInquilini: userId },
        { idInquilino: userId },
    ],
});

const normalizzaContratto = (contratto) => {
    const plain = typeof contratto?.toObject === 'function' ? contratto.toObject() : { ...contratto };

    if (!Array.isArray(plain.idInquilini) || plain.idInquilini.length === 0) {
        if (plain.idInquilino) {
            plain.idInquilini = [plain.idInquilino];
        } else {
            plain.idInquilini = [];
        }
    }

    return plain;
};

const getContratti = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id; // Supporta sia sub che id a seconda di come è strutturato il token

        if (!userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        // Verifica che l'utente esista e sia verificato
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        if (user.ruolo !== 'utente verificato' && user.ruolo !== 'inquilino') {
            return res.status(403).json({ error: 'Utente non autorizzato' });
        }

        // Recupera tutti i contratti dell'utente loggato
        const contratti = await Contratto.find(buildContrattoInquilinoFilter(userId)).populate('idAppartamento').lean();

        // Restituisce i contratti così come sono, lasciando al frontend la separazione attivi/passati
        return res.status(200).json({ contratti: contratti.map(normalizzaContratto) });
    } catch (error) {
        console.error('Errore getContratti:', error)
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
};

const segnalaGuasto = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        if (user.ruolo !== 'inquilino') {
            return res.status(403).json({ error: 'Utente non autorizzato' });
        }

        const { idAppartamento, descrizione, categoria, foto = [], priorita } = req.body || {};

        if (!idAppartamento) {
            return res.status(400).json({ errors: ['L\'appartamento associato è obbligatorio e deve essere valido'] });
        }

        const contrattoAttivo = await Contratto.findOne(
            buildContrattoInquilinoFilter(userId, {
                idAppartamento: idAppartamento,
                stato: 'attivo',
            })
        );

        if (!contrattoAttivo) {
            return res.status(403).json({ error: 'Non hai un contratto attivo per questo appartamento' });
        }

        const errori = [];
        if (!descrizione || !descrizione.trim()) errori.push('La descrizione del guasto è obbligatoria');

        if (errori.length > 0) {
            return res.status(400).json({ errors: errori });
        }

        const guasto = await Guasto.create({
            idAppartamento: idAppartamento,
            idInquilino: userId,
            descrizione: descrizione.trim(),
            categoria: categoria.trim(),
            priorita: priorita || 'media',
            foto: Array.isArray(foto) ? foto.filter((url) => typeof url === 'string' && url.trim() !== '') : [],
            stato: 'segnalato',
        });

        return res.status(201).json({ data: guasto });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors });
        }

        console.error('Errore segnalaGuasto:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}

const getGuastiAppartamento = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ error: 'Utente non autenticato' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato' });

        const { appId } = req.params;
        if (!appId) return res.status(400).json({ error: 'ID appartamento mancante' });

        const isAdmin = user.ruolo === 'amministratore';
        const isTenant = user.ruolo === 'utente verificato' || user.ruolo === 'inquilino';

        if (!isAdmin && !isTenant) {
            return res.status(403).json({ error: 'Utente non autorizzato' });
        }

        if (isAdmin) {
            const appartamento = await Appartamento.findOne({ _id: appId, amministratoreId: userId });
            if (!appartamento) {
                return res.status(403).json({ error: 'Non autorizzato a visualizzare le segnalazioni di questo appartamento' });
            }
        } else {
            const contratto = await Contratto.findOne(
                buildContrattoInquilinoFilter(userId, {
                    idAppartamento: appId,
                    stato: 'attivo',
                })
            );
            if (!contratto) return res.status(403).json({ error: 'Non autorizzato a visualizzare i guasti di questo appartamento' });
        }

        const guasti = await Guasto.find({ idAppartamento: appId }).sort({ createdAt: -1 });

        return res.status(200).json({ data: guasti });
    } catch (error) {
        console.error('Errore getGuastiAppartamento:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
 
const prendiInCaricoGuastoAdmin = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ error: 'Utente non autenticato' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato' });
        if (user.ruolo !== 'amministratore') return res.status(403).json({ error: 'Non autorizzato' });

        const { guastoId } = req.params;
        if (!guastoId) return res.status(400).json({ error: 'ID guasto mancante' });

        const guasto = await Guasto.findById(guastoId);
        if (!guasto) return res.status(404).json({ error: 'Segnalazione non trovata' });

        // Verifica che l'amministratore gestisca l'appartamento del guasto
        const appartamento = await Appartamento.findOne({ _id: guasto.idAppartamento, amministratoreId: userId });
        if (!appartamento) return res.status(403).json({ error: 'Non autorizzato a modificare questa segnalazione' });

        // Aggiorna stato e dataPresoInCarico
        guasto.stato = 'preso in carico';
        guasto.dataPresoInCarico = Date.now();
        await guasto.save();

        return res.status(200).json({ data: guasto });
    } catch (error) {
        console.error('Errore prendiInCaricoGuastoAdmin:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}

const risolviGuasto = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ error: 'Utente non autenticato' });

        const { guastoId } = req.params;
        if (!guastoId) return res.status(400).json({ error: 'ID guasto mancante' });

        const guasto = await Guasto.findById(guastoId);
        if (!guasto) return res.status(404).json({ error: 'Segnalazione non trovata' });

        // Verifica che l'utente abbia un contratto attivo per quell'appartamento
        const contratto = await Contratto.findOne(
            buildContrattoInquilinoFilter(userId, {
                idAppartamento: guasto.idAppartamento,
                stato: 'attivo',
            })
        );
        if (!contratto) return res.status(403).json({ error: 'Non autorizzato a modificare questa segnalazione' });

        // Verifica che lo stato sia "preso in carico"
        if (guasto.stato !== 'preso in carico') {
            return res.status(400).json({ error: 'La segnalazione non può essere risolta in questo stato' });
        }

        // Aggiorna stato e dataSistemazione
        guasto.stato = 'sistemato';
        guasto.dataSistemazione = new Date();
        await guasto.save();

        return res.status(200).json({ data: guasto });
    } catch (error) {
        console.error('Errore risoluzione guasto:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}

const aggiornaListaSpesa = async (req, res) => {
    try{
        const userId = req.user?.sub || req.user?.id || req.user?._id;
        if(!userId) return res.status(401).json({error: 'Utente non autenticato'});

        const {contrattoId} = req.params;
        if(!contrattoId) return res.status(400).json({error: 'ID contratto mancante'});

        const contratto = await Contratto.findById(contrattoId);
        if(!contratto) return res.status(404).json({error: 'Contratto non trovato nel db'});

        // Verifica che l'utente abbia un contratto attivo per quell'appartamento
        const isInquilino = contratto.idInquilini.some(id => id.toString() === userId.toString());
        if(!isInquilino) return res.status(403).json({error: 'Non autorizzato a modificare questa lista della spesa'});

        const { listaSpesa } = req.body;
        if(!Array.isArray(listaSpesa)) return res.status(400).json({error: 'La lista della spesa deve essere un array'});

        // Validazione base degli oggetti nella lista della spesa
        for(const item of listaSpesa){
            if(typeof item.nome !== 'string' || item.nome.trim() === ''){
                return res.status(400).json({error: 'Ogni elemento deve avere un nome valido'});
            }
            if(typeof item.quantita !== 'number' || item.quantita <= 0){
                return res.status(400).json({error: 'Ogni elemento deve avere una quantità valida'});
            }
        }

        contratto.listaSpesa = listaSpesa.map(item => ({
            nome: item.nome.trim(),
            quantita: item.quantita,
            preso: item.preso || false
        }));

        await contratto.save();

        return res.status(200).json({data: contratto.listaSpesa});
    }   
    catch(error){
        console.error('Errore aggiornaListaSpesa:', error);
        return res.status(500).json({error: error.message, stack: error.stack});
    }
}

module.exports = { getContratti, segnalaGuasto, getGuastiAppartamento, prendiInCaricoGuastoAdmin, risolviGuasto, aggiornaListaSpesa };