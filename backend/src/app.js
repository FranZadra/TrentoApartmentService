const express = require('express');

const app = express();

// Middleware: permette a Express di leggere il corpo delle richieste in formato JSON
app.use(express.json());

// --- Collegamento delle routes ---
// Tutte le richieste che iniziano con /api/v1/users vengono gestite da userRoutes
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/v1/users', userRoutes);

// Route di "health": check utile per verificare che il server sia ok
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server funzionante' });
});


// --- Middleware di gestione errori ---
app.use(errorHandler);

module.exports = app;