// src/models/Annuncio.js — Modello Annuncio
//
// Attributi dal diagramma UML: stato, descrizione, dataPubbl
// Ogni annuncio è collegato a un Appartamento tramite riferimento (ObjectId).

const mongoose = require('mongoose');

const AnnuncioSchema = new mongoose.Schema(
  {
    // Attributi definiti nel diagramma UML
    stato: {
      type: String,
      enum: ['Creato', 'Attivo', 'Archiviato'], // AdvStatus dal diagramma UML
      // 'Creato': annuncio appena creato, non ancora visibile
      // 'Attivo': visibile nella lista e sulla mappa (US9)
      // 'Archiviato': non più disponibile
      required: true,
      default: 'Creato',
    },
    descrizione: {
      type: String,
      required: [true, 'La descrizione è obbligatoria'],
      trim: true,
    },
    dataPubbl: {
      type: Date,
      required: true,
      default: Date.now, // automatica alla creazione
    },

    // Relazione con Appartamento 
    appartamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appartamento',
      required: [true, "L'annuncio deve essere collegato a un appartamento"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Annuncio', AnnuncioSchema);
