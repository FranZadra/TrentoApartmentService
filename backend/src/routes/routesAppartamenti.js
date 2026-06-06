const express = require('express')
const router = express.Router()

// Rotte dedicate agli appartamenti: elenco pubblico, area amministratore e operazioni CRUD.

const {
  creaAppartamento,
  getAppartamenti,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getContattoAdmin,
  associaInquilino,
} = require('../controllers/controllerAppartamenti')

const { getBolletteAppartamento } = require('../controllers/bolletteController')

const { getAnnuncioByAppartamento, upsertAnnuncioByAppartamento } = require('../controllers/annunciController')

const { autenticaToken, autenticaTokenOpzionale } = require('../middleware/auth')
const { verificaBodyCreazione, verificaBodyAggiornamento } = require('../middleware/verificaBody')
const { verificaProprietario } = require('../middleware/verificaPropr')

// Lista pubblica degli appartamenti con paginazione.
router.get('/', autenticaTokenOpzionale, getAppartamenti)

// Crea un nuovo appartamento solo se l'utente è autenticato.
router.post('/', autenticaToken, verificaBodyCreazione, creaAppartamento)

// Contatto WhatsApp dell'amministratore: solo utenti autenticati (registrati).
router.get('/:id/contatto-admin', autenticaToken, getContattoAdmin)

router.get('/:appId/bollette', autenticaToken, getBolletteAppartamento)

router.get('/:appartamentoId/annuncio', autenticaToken, getAnnuncioByAppartamento)
router.post('/:appartamentoId/annuncio', autenticaToken, upsertAnnuncioByAppartamento)

// Dettaglio di un singolo appartamento.
router.get('/:id', getAppartamentoDaId)

// Aggiorna un appartamento solo se appartiene all'utente autenticato.
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento)

// Associa un inquilino (via email) all'appartamento creando/aggiornando un contratto.
router.post('/:appartamentoId/associa-inquilino', autenticaToken, associaInquilino)

// Elimina un appartamento solo se appartiene all'utente autenticato.
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento)

module.exports = router;
