// Routes per la gestione degli appartamenti

const express = require('express')
const router = express.Router()

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

// GET appartamenti
// Lista pubblica degli appartamenti
router.get('/', autenticaTokenOpzionale, getAppartamenti)

// POST appartamento
// Crea un nuovo appartamento solo se l'utente è autenticato.
router.post('/', autenticaToken, verificaBodyCreazione, creaAppartamento)

// GET contatto admin
// Contatto WhatsApp dell'amministratore: solo utenti autenticati
router.get('/:id/contatto-admin', autenticaToken, getContattoAdmin)

// GET bollette appartamento
router.get('/:appId/bollette', autenticaToken, getBolletteAppartamento)

// GET e POST annuncio associato all'appartamento
router.get('/:appartamentoId/annuncio', autenticaToken, getAnnuncioByAppartamento)
router.post('/:appartamentoId/annuncio', autenticaToken, upsertAnnuncioByAppartamento)

// GET appartamento da ID
// Dettaglio di un singolo appartamento.
router.get('/:id', getAppartamentoDaId)

// PUT appartamento
// Aggiorna un appartamento solo se appartiene all'utente autenticato
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento)

// POST associa inquilino
// Associa un inquilino all'appartamento creando/aggiornando un contratto.
router.post('/:appartamentoId/associa-inquilino', autenticaToken, associaInquilino)

// DELETE appartamento
// Elimina un appartamento
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento)

module.exports = router;
