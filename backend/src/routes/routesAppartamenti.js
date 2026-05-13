// src/routes/routesAppartamenti.js — Routes CRUD Appartamento
//
// Definisce gli endpoint REST per la gestione degli appartamenti:
// - POST /appartamenti → crea appartamento
// - GET /appartamenti → lista appartamenti (con paginazione e filtri)
// - GET /appartamenti/:id → dettaglio appartamento
// - PUT /appartamenti/:id → aggiorna appartamento
// - DELETE /appartamenti/:id → elimina appartamento
// - GET /admin/:amministratoreId/appartamenti → appartamenti di un amministratore

const express = require('express');
const router = express.Router();

const {
  creaAppartamento,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getAppartamentiAdmin,
} = require('../controllers/controllerAppartamenti');

// Middleware di autenticazione e validazione
const { autenticaToken } = require('../middleware/auth');
const { verificaBodyCreazione, verificaBodyAggiornamento } = require('../middleware/verificaBody');
const { verificaProprietario } = require('../middleware/verificaPropr');

/**
 * POST /appartamenti
 * Crea un nuovo appartamento.
 * Richiede autenticazione e validazione del body.
 */
router.post('/', autenticaToken, verificaBodyCreazione, creaAppartamento);

/*
 * GET /appartamenti
 * Recupera la lista di appartamenti con paginazione e filtri.
 * Query params: page, limit, perStudenti, città
 
router.get('/', (req, res, next) => {
  // Placeholder: per ora supportiamo solo le altre rotte
  res.status(200).json({
    success: true,
    message: 'GET /appartamenti - Lista appartamenti (da implementare con filtri avanzati)',
  });
});
*/

/**
 * GET /admin/:amministratoreId
 * Recupera tutti gli appartamenti gestiti da un amministratore.
 * Richiede autenticazione.
 * Query params: page, limit
 * NOTA: Questa rotta deve venire PRIMA di GET /:id per evitare conflicts
 */
router.get('/admin/:amministratoreId', autenticaToken, getAppartamentiAdmin);

/**
 * GET /appartamenti/:id
 * Recupera i dettagli di un appartamento specifico.
 * Richiede autenticazione.
 */
router.get('/:id', autenticaToken, getAppartamentoDaId);

/**
 * PUT /appartamenti/:id
 * Aggiorna un appartamento.
 * Richiede autenticazione, validazione del body, e che l'utente sia il proprietario.
 */
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento);

/**
 * DELETE /appartamenti/:id
 * Elimina un appartamento.
 * Richiede autenticazione e che l'utente sia il proprietario.
 */
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento);

module.exports = router;
