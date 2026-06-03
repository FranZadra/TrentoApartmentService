const express = require('express')
const router = express.Router()

// Rotte dedicate agli appartamenti: elenco pubblico, area amministratore e operazioni CRUD.

const {
  creaAppartamento,
  getAppartamenti,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getAppartamentiAdmin,
  getContattoAdmin,
} = require('../controllers/controllerAppartamenti')

const { autenticaToken } = require('../middleware/auth')
const { verificaBodyCreazione, verificaBodyAggiornamento } = require('../middleware/verificaBody')
const { verificaProprietario } = require('../middleware/verificaPropr')

// Lista pubblica degli appartamenti con paginazione.
router.get('/', getAppartamenti)

// Crea un nuovo appartamento solo se l'utente è autenticato.
router.post('/', autenticaToken, verificaBodyCreazione, creaAppartamento)

// Elenco degli appartamenti collegati all'amministratore loggato.
router.get('/admin', autenticaToken, getAppartamentiAdmin)

// Contatto WhatsApp dell'amministratore: solo utenti autenticati (registrati).
router.get('/:id/contatto-admin', autenticaToken, getContattoAdmin)

// Dettaglio di un singolo appartamento.
router.get('/:id', getAppartamentoDaId)

// Aggiorna un appartamento solo se appartiene all'utente autenticato.
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento)

// Elimina un appartamento solo se appartiene all'utente autenticato.
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento)

module.exports = router;
