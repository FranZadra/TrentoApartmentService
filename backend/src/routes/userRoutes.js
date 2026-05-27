const express = require('express');
const router = express.Router();
const { register, login, verificaIdentita } = require('../controllers/authController');
const { autenticaToken } = require('../middleware/auth');

// Le rotte utente servono per creare un account e per entrare nella piattaforma.

// POST /api/v1/users/register → gestita dalla funzione "register" nel controller
router.post('/register', register);

// POST /api/v1/users/login → controlla le credenziali e restituisce il token.
router.post('/login', login);

// PUT /api/v1/users/verificaIdentita → richiede autenticazione
router.put('/verificaIdentita', autenticaToken, verificaIdentita);

module.exports = router;
