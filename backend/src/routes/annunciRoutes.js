// src/routes/annunci.routes.js — Definizione degli endpoint per gli annunci
//
// Questo file collega gli URL HTTP alle funzioni del controller.
// È il "sommario" delle API: guardando qui si capisce subito
// cosa fa ogni endpoint, senza entrare nella logica.

const express = require('express');
const router = express.Router();
const {
  getAnnunciAttivi,
  getAnnuncioById,
} = require('../controllers/annunciController');

// GET /api/v1/annunci
// Lista di tutti gli annunci attivi (per la lista e la mappa)
// Accessibile da tutti, anche utenti anonimi (nessuna auth)
router.get('/', getAnnunciAttivi);

// GET /api/v1/annunci/:id
// Dettaglio di un singolo annuncio
router.get('/:id', getAnnuncioById);

module.exports = router;