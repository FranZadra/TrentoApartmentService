const express = require('express');
const router = express.Router();
const { register, login, verificaIdentita, richiediResetPassword, resetPassword } = require('../controllers/authController');
const { autenticaToken } = require('../middleware/auth');

// Le rotte utente servono per creare un account e per entrare nella piattaforma.

// POST /api/v1/users/register → gestita dalla funzione "register" nel controller
router.post('/register', register);

// POST /api/v1/users/login → controlla le credenziali e restituisce il token.
router.post('/login', login);

// PUT /api/v1/users/verifica-identita → richiede autenticazione
router.put('/verifica-identita', autenticaToken, verificaIdentita);

// POST /api/v1/users/password/forgot → invia il link di recupero password via email
router.post('/password/forgot', richiediResetPassword);

// POST /api/v1/users/password/reset → completa il reset con il token ricevuto via email
router.post('/password/reset', resetPassword);

module.exports = router;
