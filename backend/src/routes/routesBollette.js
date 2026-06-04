// src/routes/routesBollette.js — Route bollette
//
// US27: endpoint per l'amministratore (carica, lista, paga, elimina)
// US20: endpoint per l'inquilino (lista con dati grafici, download PDF)

const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  caricaBolletta,
  getBolletteAdmin,
  segnaPagata,
  eliminaBolletta,
  getBolletteInquilino,
  scaricaPdf,
} = require('../controllers/bolletteController');

const { autenticaToken } = require('../middleware/auth');

// Multer con memory storage: il file viene letto come Buffer e poi salvato in MongoDB.
// Limite 10 MB per bolletta PDF (tipicamente pochi centinaia di KB).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Rotte amministratore ──────────────────────────────────────────────────────
// POST   /api/v1/bollette/:appartamentoId       — carica nuova bolletta (con PDF opzionale)
// GET    /api/v1/bollette/admin/:appartamentoId — lista bollette di un appartamento
// PUT  /api/v1/bollette/:bollettaId/paga      — segna bolletta come pagata
// DELETE /api/v1/bollette/:bollettaId           — elimina bolletta

router.post(
  '/:appartamentoId',
  autenticaToken,
  upload.single('pdf'),
  caricaBolletta
);

router.get('/admin/:appartamentoId', autenticaToken, getBolletteAdmin);

router.put('/:bollettaId/paga', autenticaToken, segnaPagata);

router.delete('/:bollettaId', autenticaToken, eliminaBolletta);

// ── Rotte inquilino ───────────────────────────────────────────────────────────
// GET /api/v1/bollette/inquilino  — lista bollette del proprio appartamento + dati grafici

router.get('/inquilino', autenticaToken, getBolletteInquilino);

// ── Download PDF (admin e inquilino) ─────────────────────────────────────────
// GET /api/v1/bollette/:bollettaId/pdf

router.get('/:bollettaId/pdf', autenticaToken, scaricaPdf);

module.exports = router;
