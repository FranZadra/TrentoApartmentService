const Contratto = require('../models/Contratto');
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

module.exports = { getContratti };