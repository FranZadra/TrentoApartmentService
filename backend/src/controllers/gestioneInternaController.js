const Contratto = require('../models/Contratto');
const Guasto = require('../models/Guasto');
const Appartamento = require('../models/Appartamento');
const User = require('../models/User');

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
        const contratti = await Contratto.find({ idInquilino: userId }).populate('idAppartamento');

        // Restituisce i contratti così come sono, lasciando al frontend la separazione attivi/passati
        return res.status(200).json({ contratti });
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

        const contrattoAttivo = await Contratto.findOne({
            idInquilino: userId,
            idAppartamento: idAppartamento,
            stato: 'attivo',
        });

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
            const contratto = await Contratto.findOne({ idInquilino: userId, idAppartamento: appId, stato: 'attivo' });
            if (!contratto) return res.status(403).json({ error: 'Non autorizzato a visualizzare i guasti di questo appartamento' });
        }

        const guasti = await Guasto.find({ idAppartamento: appId }).sort({ createdAt: -1 });

        return res.status(200).json({ data: guasti });
    } catch (error) {
        console.error('Errore getGuastiAppartamento:', error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
 
const getGuastiAppartamentoAdmin = getGuastiAppartamento;

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
        const contratto = await Contratto.findOne({ idInquilino: userId, idAppartamento: guasto.idAppartamento, stato: 'attivo' });
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

module.exports = { getContratti, segnalaGuasto, getGuastiAppartamento, getGuastiAppartamentoAdmin, prendiInCaricoGuastoAdmin, risolviGuasto };