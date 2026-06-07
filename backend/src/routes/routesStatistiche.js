// Routes per le statistiche per i dipendenti del comune

const express = require('express');
const router = express.Router();
const { getStatistiche } = require('../controllers/statisticheController');
const { autenticaToken } = require('../middleware/auth');

// GET statistiche
router.get('/', autenticaToken, getStatistiche);

module.exports = router;
