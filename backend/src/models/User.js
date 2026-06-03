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
    // Cognome dell'utente - campo obbligatorio, spazi iniziali/finali rimossi automaticamente
    cognome: {
      type: String,
      required: [true, 'Il cognome è obbligatorio'],
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

    // Recupero password: token hashato e scadenza temporanea
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    /*foto profuilo - opzionale, URL dell'immagine
    fotoProfilo: {
      type: String,
      required: false,
      default: null,
    },*/
    telefono: {
      type: String,
      required: false,
      default: null,
    },

    // Ruolo dell'utente nell'applicazione
    // 'inquilino'    = cerca appartamenti
    // 'proprietario' = pubblica annunci
    ruolo: {
      type: String,
      enum: ['utente base', 'utente verificato', 'inquilino', 'amministratore', 'dipendente comune'],
      default: 'utente base',
    },
    // Per amministratori: true se account privato, false se agenzia
    privato: {
      type: Boolean,
      required: function() { return this.ruolo === 'amministratore'; },
    },
    // Per agenzie: partita IVA obbligatoria (11 cifre)
    pIVA: {
      type: String,
      required: function() { return this.ruolo === 'amministratore' && this.privato === false; },
      match: [/^\d{11}$/, 'La partita IVA deve essere composta da 11 cifre'],
    },
    // Per dipendenti comunali: ruolo specifico e dipartimento
    ruoloDipendente: {
      type: String,
      required: function() { return this.ruolo === 'dipendente comune'; },
    },
    dipartimento: {
      type: String,
      required: function() { return this.ruolo === 'dipendente comune'; },
    },
  },
  {
    // Aggiunge automaticamente i campi "createdAt" e "updatedAt" ad ogni documento
    timestamps: true,
  }
);

// Esporta il modello "User" collegato allo schema; Mongoose userà la collezione "users" (plurale automatico)
module.exports = mongoose.model('User', utenteSchema);
