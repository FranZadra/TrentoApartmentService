// src/models/Appartamento.js — Modello Appartamento
//
// Attributi dall'UML delle classi:
//   indirizzo : Address, perStudenti : Boolean, numStanze : Integer,
//   numBagni : Integer, foto : Image[0..*], terrazzo : Boolean,
//   lavatrice : Boolean, classeEnergetica : String
//
// Relazioni dal diagramma UML:
//   - Un Appartamento comprende una o più Camera (1..*)
//   - Un Annuncio pubblicizza un Appartamento
//
// Le coordinate geografiche (latitudine/longitudine) sono necessarie per la mappa interattiva della US9: vanno discusse col team.

const mongoose = require('mongoose');

// Sotto-schema per l'indirizzo (DataType Address dall'UML)
// È un oggetto annidato, non una collezione separata
const AddressSchema = new mongoose.Schema(
  {
    via: { type: String, required: true },
    numero: { type: Number, required: true },
    città: { type: String, required: true },
    CAP: { type: String, required: true },
    Stato: { type: String, required: true },
  },
  { _id: false } // Non serve un ID separato per questo sotto-documento
);

const AppartamentoSchema = new mongoose.Schema({
  indirizzo:        { type: AddressSchema, required: true },
  mqTot:            { type: Number, required: true },
  perStudenti:      { type: Boolean, default: false },
  numStanze:        { type: Number, required: true },
  numBagni:         { type: Number, required: true },
  foto:             { type: [String], default: [] },
  terrazzo:         { type: Boolean, default: false },
  lavatrice:        { type: Boolean, default: false },
  classeEnergetica: { type: String, enum: ['A4','A3','A2','A1','B','C','D','E','F','G'] },
  posizione: {
    latitudine:  Number,
    longitudine: Number,
  },
  amministratoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  camere:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'Camera' }],
}, { timestamps: true });

module.exports = mongoose.model('Appartamento', AppartamentoSchema);