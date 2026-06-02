const mongoose = require('mongoose');

const TIPI_RIFIUTI = ['Organico', 'Carta', 'Imballaggi leggeri', 'Residuo', 'Vetro'];
const DEFAULT_CALENDARIO_RIFIUTI = [
  { tipo: 'Organico', giorni: [1, 4] },
  { tipo: 'Carta', giorni: [2] },
  { tipo: 'Imballaggi leggeri', giorni: [3] },
  { tipo: 'Residuo', giorni: [5] },
  { tipo: 'Vetro', giorni: [6] },
];

const CalendarioRifiutiSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: TIPI_RIFIUTI,
      required: true,
    },
    giorni: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const OggettoSpesaSchema = new mongoose.Schema({
    nome : { type: String, required: true },
    quantita : { type: Number, required: true },
    preso : { type: Boolean, default: false }
}, { _id: false });

const ContrattoSchema = new mongoose.Schema(
  {
    idAppartamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appartamento',
      required: true,
    },
    idInquilini: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Almeno un inquilino è obbligatorio',
      },
    },
    dataInizio: {
      type: Date,
      required: true,
    },
    dataFine: {
      type: Date,
      required: true,
    },
    canoneMensile: {
      type: Number,
      required: true,
    },
    stato: {
        type: String,
        enum: ['attivo', 'terminato', 'in chiusura'],
        default: 'attivo',
    },
    tipoContratto: {
      type: String,
      required: true
    },
    listaSpesa: {
      type: [OggettoSpesaSchema],
      default: []
    },
    calendarioRifiuti: {
      type: [CalendarioRifiutiSchema],
      default: () => DEFAULT_CALENDARIO_RIFIUTI,
    },
  },  
  {
    timestamps: true,
    collection: 'contrattos',
  }
);

module.exports = mongoose.model('Contratto', ContrattoSchema);