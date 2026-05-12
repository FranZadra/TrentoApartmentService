// src/config/db.js — Connessione al database
//
// Configurato per MongoDB tramite Mongoose.
// Ancora da decidere se usare Firestore

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connesso: ${conn.connection.host}`);
  } catch (error) {
    console.error('Errore connessione MongoDB:', error.message);
    process.exit(1); // Termina l'app se il DB non è raggiungibile
  }
};

module.exports = connectDB;
