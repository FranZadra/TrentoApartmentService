// src/controllers/annunci.controller.js — Logica delle API per gli annunci
//
// Funzioni eseguite quando il front chiama le API. 
// Ognu funzione:
//   1. Riceve la richiesta (req)
//   2. Interagisce con il database
//   3. Manda la risposta (res) in formato JSON

const Annuncio = require('../models/Annuncio');

// GET /api/v1/annunci
// Ritorna tutti gli annunci con stato "attivo", inclusi i dati dell'appartamento.
// Usato dal frontend sia per la lista che per la mappa interattiva.
const getAnnunciAttivi = async (req, res, next) => {
  try {
    const annunci = await Annuncio
      .find({ stato: 'Attivo' })         // Filtra solo gli annunci attivi
      .populate('appartamento')          // Sostituisce l'ID con i dati completi
      .sort({ dataPubbl: -1 });          // In ordine dal più recente al più vecchio

    // Risposta di successo
    res.status(200).json({
      success: true,
      count: annunci.length,             // Utile per il frontend
      data: annunci,
    });
  } catch (error) {
    // Passa l'errore al middleware errorHandler (vedi errorHandler.js)
    next(error);
  }
};

// GET /api/v1/annunci/:id
// Ritorna il dettaglio di un singolo annuncio (utile per il click sul marker della mappa o sulla card della lista).
const getAnnuncioById = async (req, res, next) => {
  try {
    const annuncio = await Annuncio
      .findById(req.params.id)
      .populate('appartamento');

    // Se l'annuncio non esiste, rispondiamo con 404
    if (!annuncio) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato',
      });
    }

    res.status(200).json({
      success: true,
      data: annuncio,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnunciAttivi,
  getAnnuncioById,
};
