// Model per gli utenti

const mongoose = require('mongoose');

// Schema che descrive la struttura di un User
const utenteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      trim: true,
    },
    cognome: {
      type: String,
      required: [true, 'Il cognome è obbligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password obbligatoria
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
    telefono: {
      type: String,
      required: false,
      default: null,
    },

    // Ruolo dell'utente nell'applicazione
    // 'inquilino' = cerca appartamenti
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
    // Per agenzie: partita IVA obbligatoria
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
    timestamps: true,
    collection: 'Users', 
  }
);

module.exports = mongoose.model('User', utenteSchema);
