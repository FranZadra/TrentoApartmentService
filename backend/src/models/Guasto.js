// Model per i guasti

const mongoose = require('mongoose');

// Schema che descrive la struttura di un guasto
const guastoSchema = new mongoose.Schema(
  {
    idAppartamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appartamento',
      required: true,
    },
    idInquilino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    descrizione: {
      type: String,
      required: [true, 'La descrizione del guasto è obbligatoria'],
      trim: true,
    },
    stato: {
      type: String,
        enum: ['segnalato', 'preso in carico', 'sistemato', 'archiviato'],
        default: 'segnalato',
    },
    categoria: {
      type: String,
    },
    priorita: {
      type: String,
      enum: ['scarsa', 'media', 'urgente'],
      default: 'media',
    },
    dataSegnalazione: {
      type: Date,
      default: Date.now,
    },
    dataPresoInCarico: {
      type: Date,
    },
    dataSistemazione: {
      type: Date,
    },
    foto : [{
      type: String,
    }]
  },
  { timestamps: true ,
    collection: 'Guasti' }
);

module.exports = mongoose.model('Guasto', guastoSchema);