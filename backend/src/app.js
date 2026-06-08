// Configurazione middleware e routes principali dell'app

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const annunciRoutes = require('./routes/annunciRoutes');
const userRoutes = require('./routes/userRoutes');
const routesAppartamenti = require('./routes/routesAppartamenti');
const routesGestioneInterna = require('./routes/routesGestioneInterna');
const routesStatistiche = require('./routes/routesStatistiche');
const routesBollette = require('./routes/routesBollette');

const app = express();
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
  ]
}));
app.use(express.json()); 
// Routes
app.use('/api/v2/annunci', annunciRoutes);
app.use('/api/v2/users', userRoutes);
app.use('/api/v2/appartamenti', routesAppartamenti);
app.use('/api/v2/gestione-interna', routesGestioneInterna);
app.use('/api/v2/statistiche', routesStatistiche);
app.use('/api/v2/bollette', routesBollette);

// Route di "health": check utile per verificare che il server funzioni
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server funzionante' });
});

// Middleware di gestione errori
app.use(errorHandler);

module.exports = app;
