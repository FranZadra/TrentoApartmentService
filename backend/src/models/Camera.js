// Model per le camere

const mongoose = require('mongoose');

// Schema per una singola camera
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
  { _id: false }
);

module.exports = CameraSchema;
