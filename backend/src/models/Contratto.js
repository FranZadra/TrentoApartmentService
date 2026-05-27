const mongoose = require('mongoose');

const ContrattoSchema = new mongoose.Schema(
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
  },  
  {
    timestamps: true,
    collection: 'contrattos',
  }
);

module.exports = mongoose.model('Contratto', ContrattoSchema);