const Contratto = require('../models/Contratto');
const Guasto = require('../models/Guasto');
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

module.exports = { getContratti, segnalaGuasto };