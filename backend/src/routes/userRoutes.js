// Routes per la gestione degli utenti

const express = require('express');
const router = express.Router();
const { register, login, verificaIdentita, richiediResetPassword, resetPassword } = require('../controllers/authController');
const { autenticaToken } = require('../middleware/auth');


// POST registrazione nuovo utente
router.post('/register', register);

// POST login utente (restituisce JWT)
router.post('/login', login);

// PUT verifica identità utente (richiede JWT valido)
router.put('/verifica-identita', autenticaToken, verificaIdentita);

// POST richiesta reset password
router.post('/password/forgot', richiediResetPassword);

// POST reset password
router.post('/password/reset', resetPassword);

module.exports = router;
