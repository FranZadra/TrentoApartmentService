// src/app.js — Configurazione Express
// Qui si registrano i middleware globali e le route

const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const annunciRoutes = require('./routes/annunciRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware globali
app.use(express.json()); // Permette di leggere il body JSON nelle richieste

// Route
// Tutte le route degli annunci saranno precedute da /api/v1/annunci
app.use('/api/v1/annunci', annunciRoutes);
app.use('/api/v1/users', userRoutes);

// Route di "health": check utile per verificare che il server sia ok
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server funzionante' });
});

// Gestione errori (deve stare dopo le route)
app.use(errorHandler);

module.exports = app;
