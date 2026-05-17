// server.js — punto di partenza dell'applicazione.
// Qui viene caricato l'ambiente, collegato il database e avviato Express.

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connessione al DB, poi avvio del server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
  });
});
