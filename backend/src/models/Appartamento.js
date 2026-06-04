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
const CameraSchema = require('./Camera');

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

const AppartamentoSchema = new mongoose.Schema(
  {
    indirizzo: {
      type: AddressSchema,
      required: true,
    },
    mqTot: {
      type: Number,
      required: false,
    },
    perStudenti: {
      type: Boolean,
      required: true,
      default: false,
    },
    numStanze: {
      type: Number,
      required: true,
    },
    numBagni: {
      type: Number,
      required: true,
    },
    foto: {
      type: [String], // Array di URL delle immagini (Image[0..*] nell'UML)
      default: [],
    },
    terrazzo: {
      type: Boolean,
      default: false,
    },
    lavatrice: {
      type: Boolean,
      default: false,
    },
    classeEnergetica: {
      type: String,
      enum: ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'],
    },
    // Coordinate geografiche
    posizione: {
      latitudine: { type: Number },
      longitudine: { type: Number },
    },
    amministratoreId: 
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    // Le camere sono memorizzate come sotto-documenti annidati (non reference)
    camere: [CameraSchema],
  },
  {
    timestamps: true,
    collection: 'Appartamenti',
  }
);

module.exports = mongoose.model('Appartamento', AppartamentoSchema);
