// Routes per la gestione delle bollette

const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  caricaBolletta,
  segnaPagata,
  eliminaBolletta,
  scaricaPdf,
} = require('../controllers/bolletteController');

const { autenticaToken } = require('../middleware/auth');

// Multer con memory storage: il file viene letto come Buffer e poi salvato in MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST caricamento bolletta con PDF
router.post('/:appartamentoId', autenticaToken, upload.single('pdf'), caricaBolletta);

// PUT segna bolletta come pagata
router.put('/:bollettaId/paga', autenticaToken, segnaPagata);

// DELETE elimina bolletta
router.delete('/:bollettaId', autenticaToken, eliminaBolletta);

// GET scarica PDF bolletta
router.get('/:bollettaId/pdf', autenticaToken, scaricaPdf);

module.exports = router;
