const express = require('express');
const router = express.Router();
const { getContratti, getCalendarioRifiuti, aggiornaCalendarioRifiuti, segnalaGuasto, getGuastiAppartamento, prendiInCaricoGuastoAdmin, risolviGuasto, getFaccende, aggiungiFaccenda, aggiornaFaccenda, eliminaFaccenda } = require('../controllers/gestioneInternaController');
const { autenticaToken } = require('../middleware/auth');

// Rotte per la gestione interna dell'inquilino/utente verificato.
router.get('/contratti', autenticaToken, getContratti);
router.get('/rifiuti/:appId', autenticaToken, getCalendarioRifiuti);
router.put('/rifiuti/:appId', autenticaToken, aggiornaCalendarioRifiuti);

// Faccende del calendario condiviso (US23): solo inquilino, solo sul proprio appartamento.
router.get('/faccende/:appId', autenticaToken, getFaccende);
router.post('/faccende/:appId', autenticaToken, aggiungiFaccenda);
router.put('/faccende/:appId/:faccendaId', autenticaToken, aggiornaFaccenda);
router.delete('/faccende/:appId/:faccendaId', autenticaToken, eliminaFaccenda);

router.post('/guasti', autenticaToken, segnalaGuasto); 
router.get('/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.put('/guasti/:guastoId/risolvi', autenticaToken, risolviGuasto);
router.get('/admin/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.put('/admin/guasti/:guastoId/carico', autenticaToken, prendiInCaricoGuastoAdmin);

module.exports = router;