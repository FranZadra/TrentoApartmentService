const mongoose = require('mongoose');
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

const TIPI_RIFIUTI = ['Organico', 'Carta', 'Imballaggi leggeri', 'Residuo', 'Vetro'];
const DEFAULT_CALENDARIO_RIFIUTI = [
    { tipo: 'Organico', giorni: [1, 4] },
    { tipo: 'Carta', giorni: [2] },
    { tipo: 'Imballaggi leggeri', giorni: [3] },
    { tipo: 'Residuo', giorni: [5] },
    { tipo: 'Vetro', giorni: [6] },
];

const normalizzaCalendarioRifiuti = (calendarioRifiuti) => {
    const haValore = Array.isArray(calendarioRifiuti);
    const sorgente = haValore ? calendarioRifiuti : DEFAULT_CALENDARIO_RIFIUTI;
    const mappa = new Map();

    for (const voce of sorgente) {
        if (!voce || !TIPI_RIFIUTI.includes(voce.tipo)) continue;

        const giorni = Array.isArray(voce.giorni)
            ? [...new Set(voce.giorni.map((giorno) => Number.parseInt(giorno, 10)).filter((giorno) => Number.isInteger(giorno) && giorno >= 0 && giorno <= 6))].sort((a, b) => a - b)
            : [];

        mappa.set(voce.tipo, giorni);
    }

    return TIPI_RIFIUTI.map((tipo) => ({
        tipo,
        giorni: mappa.has(tipo)
            ? mappa.get(tipo)
            : (haValore ? [] : (DEFAULT_CALENDARIO_RIFIUTI.find((voce) => voce.tipo === tipo)?.giorni || [])),
    }));
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

const getCalendarioRifiuti = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const { appId } = req.params;
        if (!appId) {
            return res.status(400).json({ error: 'ID appartamento mancante' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        if (user.ruolo !== 'utente verificato' && user.ruolo !== 'inquilino') {
            return res.status(403).json({ error: 'Utente non autorizzato' });
        }

        const contratto = await Contratto.findOne(
            buildContrattoInquilinoFilter(userId, {
                idAppartamento: appId,
                stato: 'attivo',
            })
        );

        if (!contratto) {
            return res.status(403).json({ error: 'Non autorizzato per questo appartamento' });
        }

        return res.status(200).json({ data: normalizzaCalendarioRifiuti(contratto.calendarioRifiuti) });
    } catch (error) {
        console.error('Errore getCalendarioRifiuti:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
};

const aggiornaCalendarioRifiuti = async (req, res) => {
    try {
        const userId = req.user?.sub || req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const { appId } = req.params;
        if (!appId) {
            return res.status(400).json({ error: 'ID appartamento mancante' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        if (user.ruolo !== 'utente verificato' && user.ruolo !== 'inquilino') {
            return res.status(403).json({ error: 'Utente non autorizzato' });
        }

        const calendarioRifiuti = req.body?.calendarioRifiuti;
        if (!Array.isArray(calendarioRifiuti)) {
            return res.status(400).json({ error: 'Il calendario rifiuti deve essere un array valido' });
        }

        const contratto = await Contratto.findOne(
            buildContrattoInquilinoFilter(userId, {
                idAppartamento: appId,
                stato: 'attivo',
            })
        );

        if (!contratto) {
            return res.status(403).json({ error: 'Non autorizzato per questo appartamento' });
        }

        // Aggiorniamo SOLO il campo calendarioRifiuti con un update mirato.
        // NB: non usiamo contratto.save() perché save() rivalida l'INTERO documento;
        // diversi contratti nel DB usano il campo legacy "idInquilino" (singolare) e
        // non hanno "idInquilini"/"tipoContratto" valorizzati, quindi save() fallirebbe
        // con un ValidationError (causa del bug di salvataggio). Con $set tocchiamo
        // esclusivamente i rifiuti, senza rivalidare i campi legacy.
        const calendarioNormalizzato = normalizzaCalendarioRifiuti(calendarioRifiuti);
        await Contratto.updateOne({ _id: contratto._id }, { $set: { calendarioRifiuti: calendarioNormalizzato } });

        return res.status(200).json({ data: calendarioNormalizzato });
    } catch (error) {
        console.error('Errore aggiornaCalendarioRifiuti:', error);
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
        if (!priorita || !['scarsa', 'media', 'urgente'].includes(priorita)) errori.push('La priorità deve essere valida');

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

// ---- US23: Faccende del calendario condiviso ----

// Helper: verifica autenticazione + ruolo inquilino (stretto) + contratto attivo
// dell'inquilino per l'appartamento indicato. Ritorna { errore, status } in caso di
// problema, altrimenti { contratto, userId } (userId come stringa per i confronti).
const caricaContrattoInquilino = async (req) => {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) return { errore: 'Utente non autenticato', status: 401 };

    const { appId } = req.params;
    if (!appId) return { errore: 'ID appartamento mancante', status: 400 };

    const user = await User.findById(userId);
    if (!user) return { errore: 'Utente non trovato', status: 404 };
    if (user.ruolo !== 'inquilino') return { errore: 'Utente non autorizzato', status: 403 };

    const contratto = await Contratto.findOne(
        buildContrattoInquilinoFilter(userId, { idAppartamento: appId, stato: 'attivo' })
    );
    if (!contratto) return { errore: 'Non autorizzato per questo appartamento', status: 403 };

    return { contratto, userId: String(userId) };
};

const getFaccende = async (req, res) => {
    try {
        const { errore, status, contratto, userId } = await caricaContrattoInquilino(req);
        if (errore) return res.status(status).json({ error: errore });

        // Mostra tutte le faccende condivise + le private del solo richiedente.
        const faccende = (contratto.faccende || [])
            .filter((f) => f.visibilita === 'condivisa' || String(f.idCreatore) === userId)
            .map((f) => ({ ...f.toObject(), isMia: String(f.idCreatore) === userId }));

        return res.status(200).json({ data: faccende });
    } catch (error) {
        console.error('Errore getFaccende:', error);
        return res.status(500).json({ error: error.message });
    }
};

const aggiungiFaccenda = async (req, res) => {
    try {
        const { errore, status, contratto, userId } = await caricaContrattoInquilino(req);
        if (errore) return res.status(status).json({ error: errore });

        const titolo = typeof req.body?.titolo === 'string' ? req.body.titolo.trim() : '';
        if (!titolo) return res.status(400).json({ error: 'Il titolo della faccenda è obbligatorio' });

        const visibilita = req.body?.visibilita === 'condivisa' ? 'condivisa' : 'privata';
        const descrizione = typeof req.body?.descrizione === 'string' ? req.body.descrizione.trim() : '';

        // Generiamo manualmente l'_id e usiamo $push per non rivalidare l'intero contratto
        // (stesso motivo per cui i rifiuti usano updateOne: vedi aggiornaCalendarioRifiuti).
        const nuovaFaccenda = {
            _id: new mongoose.Types.ObjectId(),
            titolo,
            descrizione,
            visibilita,
            completato: false,
            idCreatore: userId,
        };

        await Contratto.updateOne({ _id: contratto._id }, { $push: { faccende: nuovaFaccenda } });

        return res.status(201).json({ data: { ...nuovaFaccenda, isMia: true } });
    } catch (error) {
        console.error('Errore aggiungiFaccenda:', error);
        return res.status(500).json({ error: error.message });
    }
};

const aggiornaFaccenda = async (req, res) => {
    try {
        const { errore, status, contratto, userId } = await caricaContrattoInquilino(req);
        if (errore) return res.status(status).json({ error: errore });

        const { faccendaId } = req.params;
        if (!mongoose.isValidObjectId(faccendaId)) {
            return res.status(400).json({ error: 'ID faccenda non valido' });
        }

        const faccenda = contratto.faccende.id(faccendaId);
        if (!faccenda) return res.status(404).json({ error: 'Faccenda non trovata' });

        const isCreatore = String(faccenda.idCreatore) === userId;
        // Una faccenda privata è gestibile solo dal suo creatore.
        if (faccenda.visibilita === 'privata' && !isCreatore) {
            return res.status(403).json({ error: 'Non puoi modificare questa faccenda' });
        }

        const set = {};
        // "completato" può essere aggiornato da qualsiasi inquilino sulle faccende condivise
        // e dal creatore su quelle private (già garantito dal controllo sopra).
        if (typeof req.body?.completato === 'boolean') {
            set['faccende.$[f].completato'] = req.body.completato;
        }
        // Titolo/descrizione/visibilità sono modificabili solo dal creatore.
        if (isCreatore) {
            if (typeof req.body?.titolo === 'string' && req.body.titolo.trim()) {
                set['faccende.$[f].titolo'] = req.body.titolo.trim();
            }
            if (typeof req.body?.descrizione === 'string') {
                set['faccende.$[f].descrizione'] = req.body.descrizione.trim();
            }
            if (req.body?.visibilita === 'privata' || req.body?.visibilita === 'condivisa') {
                set['faccende.$[f].visibilita'] = req.body.visibilita;
            }
        }

        if (Object.keys(set).length === 0) {
            return res.status(400).json({ error: 'Nessun campo valido da aggiornare' });
        }

        // Update mirato con arrayFilters: aggiorna solo la faccenda indicata.
        await Contratto.updateOne(
            { _id: contratto._id },
            { $set: set },
            { arrayFilters: [{ 'f._id': new mongoose.Types.ObjectId(faccendaId) }] }
        );

        return res.status(200).json({ data: { _id: faccendaId } });
    } catch (error) {
        console.error('Errore aggiornaFaccenda:', error);
        return res.status(500).json({ error: error.message });
    }
};

const eliminaFaccenda = async (req, res) => {
    try {
        const { errore, status, contratto, userId } = await caricaContrattoInquilino(req);
        if (errore) return res.status(status).json({ error: errore });

        const { faccendaId } = req.params;
        if (!mongoose.isValidObjectId(faccendaId)) {
            return res.status(400).json({ error: 'ID faccenda non valido' });
        }

        const faccenda = contratto.faccende.id(faccendaId);
        if (!faccenda) return res.status(404).json({ error: 'Faccenda non trovata' });

        // Solo il creatore può eliminare la propria faccenda.
        if (String(faccenda.idCreatore) !== userId) {
            return res.status(403).json({ error: 'Non puoi eliminare questa faccenda' });
        }

        await Contratto.updateOne(
            { _id: contratto._id },
            { $pull: { faccende: { _id: new mongoose.Types.ObjectId(faccendaId) } } }
        );

        return res.status(200).json({ data: { _id: faccendaId } });
    } catch (error) {
        console.error('Errore eliminaFaccenda:', error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { getContratti, getCalendarioRifiuti, aggiornaCalendarioRifiuti, segnalaGuasto, getGuastiAppartamento, prendiInCaricoGuastoAdmin, risolviGuasto, getFaccende, aggiungiFaccenda, aggiornaFaccenda, eliminaFaccenda, aggiornaListaSpesa };
