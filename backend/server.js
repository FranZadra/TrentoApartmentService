// Carica le variabili dal file .env in process.env (es. MONGODB_URI, PORT)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware: permette a Express di leggere il corpo delle richieste in formato JSON
app.use(express.json());

// --- Collegamento delle routes ---
// Tutte le richieste che iniziano con /api/v1/users vengono gestite da userRoutes
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/v1/users', userRoutes);

// --- Connessione a MongoDB Atlas ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connesso a MongoDB Atlas');

    // Avvia il server Express solo dopo che la connessione al DB è stabilita
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server in ascolto sulla porta ${PORT}`);
    });
  })
  .catch((errore) => {
    // Se la connessione fallisce (es. URI sbagliato), stampa l'errore e termina il processo
    console.error('Errore di connessione a MongoDB:', errore.message);
    process.exit(1);
  });
