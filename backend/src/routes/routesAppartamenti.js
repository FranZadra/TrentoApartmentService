const express = require('express')
const router = express.Router()

const {
  creaAppartamento,
  getAppartamenti,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getAppartamentiAdmin,
} = require('../controllers/controllerAppartamenti')

const { autenticaToken } = require('../middleware/auth')
const { verificaBodyCreazione, verificaBodyAggiornamento } = require('../middleware/verificaBody')
const { verificaProprietario } = require('../middleware/verificaPropr')

// Lista pubblica/paginata appartamenti
router.get('/', getAppartamenti)

// Crea appartamento
router.post('/', verificaBodyCreazione, creaAppartamento)

// Lista appartamenti per amministratore
router.get('/admin/:amministratoreId', autenticaToken, getAppartamentiAdmin)

// Dettaglio appartamento
router.get('/:id', getAppartamentoDaId)

// Aggiorna appartamento
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento)

// Elimina appartamento
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento)

module.exports = router;
