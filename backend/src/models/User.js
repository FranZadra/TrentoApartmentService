const mongoose = require('mongoose');

// Schema che descrive la struttura di un documento nella collezione "users" su MongoDB
const utenteSchema = new mongoose.Schema(
  {
    // Nome dell'utente - campo obbligatorio, spazi iniziali/finali rimossi automaticamente
    nome: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      trim: true,
    },

    // Email - obbligatoria, univoca (nessun duplicato nel DB), salvata sempre in minuscolo
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password - obbligatoria; nel DB viene salvato SOLO l'hash bcrypt, mai la password in chiaro
    password: {
      type: String,
      required: [true, 'La password è obbligatoria'],
    },

    /*foto profuilo - opzionale, URL dell'immagine
    fotoProfilo: {
      type: String,
      required: false,
      default: null,
    },*/
    
    // Ruolo dell'utente nell'applicazione
    // 'inquilino'    = cerca appartamenti
    // 'proprietario' = pubblica annunci
    ruolo: {
      type: String,
      enum: ['utente base', 'utente verificato', 'inquilino', 'amministratore', 'dipendente comune'],
      default: 'utente base',
    },
  },
  {
    // Aggiunge automaticamente i campi "createdAt" e "updatedAt" ad ogni documento
    timestamps: true,
  }
);

// Esporta il modello "User" collegato allo schema; Mongoose userà la collezione "users" (plurale automatico)
module.exports = mongoose.model('User', utenteSchema);
