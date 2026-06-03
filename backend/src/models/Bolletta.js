// src/models/Bolletta.js — Modello Bolletta
//
// Relazioni:
//   - Una Bolletta appartiene a un Appartamento (idAppartamento)
//   - L'amministratore viene ricavato tramite Appartamento.amministratoreId
//   - Gli inquilini autorizzati vengono ricavati tramite Contratto attivo sull'appartamento

const mongoose = require('mongoose');

const BollettaSchema = new mongoose.Schema(
  {
    idAppartamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appartamento',
      required: true,
    },
    utenza: {
      type: String,
      enum: ['luce', 'gas', 'acqua', 'elettricità'],
      required: [true, 'Il tipo di utenza è obbligatorio'],
    },
    periodoInizio: {
      type: Date,
      required: [true, 'La data di inizio periodo è obbligatoria'],
    },
    periodoFine: {
      type: Date,
      required: [true, 'La data di fine periodo è obbligatoria'],
    },
    importo: {
      type: Number,
      required: [true, "L'importo è obbligatorio"],
      min: [0, "L'importo non può essere negativo"],
    },
    pagata: {
      type: Boolean,
      default: false,
    },
    // PDF salvato direttamente nel documento come Buffer (opzione B: storage MongoDB)
    pdfData: {
      type: Buffer,
      default: null,
    },
    pdfNomeFile: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'bollette',
  }
);

module.exports = mongoose.model('Bolletta', BollettaSchema);
