// src/models/Camera.js — Schema per le camere all'interno di un Appartamento
//
// Le camere sono memorizzate come sotto-documenti annidati dentro Appartamento,
// non come collezione separata. Questo schema è usato come sotto-schema.

const mongoose = require('mongoose');

// Schema per una singola camera
// Questo NON ha un .model() perché è un sotto-schema, non una collezione separata
const CameraSchema = new mongoose.Schema(
  {
    prezzo: {
      type: Number,
      required: [true, 'Il prezzo è obbligatorio'],
    },
    numFinestre: {
      type: Number,
      default: 1,
    },
    mq: {
      type: Number,
      required: [true, 'I metri quadri sono obbligatori'],
    },
    tipo: {
      type: String,
      enum: ['SINGOLA', 'DOPPIA'],
      required: [true, 'Il tipo di camera è obbligatorio'],
    },
    disponibile: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false } // Ogni camera non ha un ID separato, solo il genitore lo ha
);

module.exports = CameraSchema;
