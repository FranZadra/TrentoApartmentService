// src/routes/routesStatistiche.js — Route statistiche per dipendenti comunali

const express = require('express');
const router = express.Router();
const { getStatistiche } = require('../controllers/statisticheController');
const { autenticaToken } = require('../middleware/auth');

// GET /api/v1/statistiche — dati aggregati e anonimizzati sul mercato degli affitti
router.get('/', autenticaToken, getStatistiche);

module.exports = router;
