const express = require('express');
const router = express.Router();
const { getContratti, getCalendarioRifiuti, aggiornaCalendarioRifiuti, segnalaGuasto, getGuastiAppartamento, prendiInCaricoGuastoAdmin, risolviGuasto, getFaccende, aggiungiFaccenda, aggiornaFaccenda, eliminaFaccenda, aggiornaListaSpesa } = require('../controllers/gestioneInternaController');
const { autenticaToken } = require('../middleware/auth');

router.get('/contratti', autenticaToken, getContratti);

// Calendario rifiuti
router.get('/rifiuti/:appId', autenticaToken, getCalendarioRifiuti);
router.put('/rifiuti/:appId', autenticaToken, aggiornaCalendarioRifiuti);

// Faccende
router.get('/faccende/:appId', autenticaToken, getFaccende);
router.post('/faccende/:appId', autenticaToken, aggiungiFaccenda);
router.put('/faccende/:appId/:faccendaId', autenticaToken, aggiornaFaccenda);
router.delete('/faccende/:appId/:faccendaId', autenticaToken, eliminaFaccenda);

// Guasti
router.post('/guasti', autenticaToken, segnalaGuasto);
router.get('/guasti/:appId', autenticaToken, getGuastiAppartamento);
router.put('/guasti/:guastoId/risolvi', autenticaToken, risolviGuasto);
router.put('/guasti/:guastoId/carico', autenticaToken, prendiInCaricoGuastoAdmin);

// Lista della spesa condivisa
router.put('/spesa/:contrattoId', autenticaToken, aggiornaListaSpesa);

module.exports = router;