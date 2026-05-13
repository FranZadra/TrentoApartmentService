const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// POST /api/v1/users/register → gestita dalla funzione "register" nel controller
router.post('/register', register);

module.exports = router;
