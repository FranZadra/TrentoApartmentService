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
  searchAnnunciWithFilters,
} = require('../controllers/annunciController');

// GET /api/v1/annunci
// Lista di tutti gli annunci attivi (per la lista e la mappa)
// Accessibile da tutti, anche utenti anonimi (nessuna auth)
router.get('/', getAnnunciAttivi);

// GET /api/v1/annunci/search/filter
// Ricerca annunci con filtri su appartamento e camere
// Query parameters: numStanze, numBagni, terrazzo, classeEnergetica, mqMin, mqMax, prezzoMin, prezzoMax, tipoCam
// Nota: questa rotta DEVE venire PRIMA di /:id per evitare che "search" sia interpretato come ID
router.get('/search/filter', searchAnnunciWithFilters);

// GET /api/v1/annunci/:id
// Dettaglio di un singolo annuncio
router.get('/:id', getAnnuncioById);

module.exports = router;