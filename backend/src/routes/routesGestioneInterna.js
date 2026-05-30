const express = require('express');
const router = express.Router();
const { getContratti, segnalaGuasto, getGuastiAppartamento, getGuastiAppartamentoAdmin, prendiInCaricoGuastoAdmin } = require('../controllers/gestioneInternaController');
const { autenticaToken } = require('../middleware/auth');

// Rotte per la gestione interna dell'inquilino/utente verificato.
router.get('/contratti', autenticaToken, getContratti);

router.post('/guasti', autenticaToken, segnalaGuasto); 
router.get('/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.get('/admin/guasti/:appId', autenticaToken, getGuastiAppartamentoAdmin);
router.put('/admin/guasti/:guastoId/carico', autenticaToken, prendiInCaricoGuastoAdmin);

module.exports = router;