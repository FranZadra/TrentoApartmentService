// Configurazione middleware e routes principali dell'app

const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const annunciRoutes = require('./routes/annunciRoutes');
const userRoutes = require('./routes/userRoutes');
const routesAppartamenti = require('./routes/routesAppartamenti');
const routesGestioneInterna = require('./routes/routesGestioneInterna');
const routesStatistiche = require('./routes/routesStatistiche');
const routesBollette = require('./routes/routesBollette');

const app = express();

// Middleware globale
app.use(express.json()); // Permette di leggere il body JSON nelle richieste

// Routes
app.use('/api/v1/annunci', annunciRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/appartamenti', routesAppartamenti);
app.use('/api/v1/gestione-interna', routesGestioneInterna);
app.use('/api/v1/statistiche', routesStatistiche);
app.use('/api/v1/bollette', routesBollette);

// Route di "health": check utile per verificare che il server sia ok
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server funzionante' });
});

// Gestione errori
app.use(errorHandler);

module.exports = app;
