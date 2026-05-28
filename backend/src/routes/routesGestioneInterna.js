const express = require('express');
const router = express.Router();
const { getContratti, segnalaGuasto } = require('../controllers/gestioneInternaController');
const { autenticaToken } = require('../middleware/auth');

// Rotte per la gestione interna dell'inquilino/utente verificato.
router.get('/contratti', autenticaToken, getContratti);

router.post('/guasti', autenticaToken, segnalaGuasto); 

module.exports = router;

