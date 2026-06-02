const express = require('express');
const router = express.Router();
const { getContratti, getCalendarioRifiuti, aggiornaCalendarioRifiuti, segnalaGuasto, getGuastiAppartamento, prendiInCaricoGuastoAdmin, risolviGuasto } = require('../controllers/gestioneInternaController');
const { autenticaToken } = require('../middleware/auth');

// Rotte per la gestione interna dell'inquilino/utente verificato.
router.get('/contratti', autenticaToken, getContratti);
router.get('/rifiuti/:appId', autenticaToken, getCalendarioRifiuti);
router.put('/rifiuti/:appId', autenticaToken, aggiornaCalendarioRifiuti);

router.post('/guasti', autenticaToken, segnalaGuasto); 
router.get('/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.put('/guasti/:guastoId/risolvi', autenticaToken, risolviGuasto);
router.get('/admin/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.put('/admin/guasti/:guastoId/carico', autenticaToken, prendiInCaricoGuastoAdmin);

module.exports = router;