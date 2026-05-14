// src/controllers/annunci.controller.js — Logica delle API per gli annunci
//
// Funzioni eseguite quando il front chiama le API. 
// Ognu funzione:
//   1. Riceve la richiesta (req)
//   2. Interagisce con il database
//   3. Manda la risposta (res) in formato JSON

const Annuncio = require('../models/Annuncio');
const Appartamento = require('../models/Appartamento');

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
    console.error('Errore in getAnnunciAttivi:', error);
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

// GET /api/v1/annunci/search/filter
// Ricerca annunci con filtri su appartamento e camere
// Query parameters:
//   - numStanze: numero esatto di stanze
//   - numBagni: numero esatto di bagni
//   - terrazzo: true/false
//   - classeEnergetica: classe energetica (es. A, B, C, ecc.)
//   - mqMin: metri quadri minimo
//   - mqMax: metri quadri massimo
//   - prezzoMin: prezzo minimo della camera
//   - prezzoMax: prezzo massimo della camera
//   - tipoCam: tipo di camera (SINGOLA/DOPPIA)
// Esempio: GET /api/v1/annunci/search/filter?numStanze=3&terrazzo=true&prezzoMin=300&prezzoMax=500
const searchAnnunciWithFilters = async (req, res, next) => {
  try {
    // Costruisce il filtro per l'appartamento
    const filterApartment = { stato: 'Attivo' };
    
    // Filtri dell'appartamento
    if (req.query.numStanze) {
      filterApartment['appartamento.numStanze'] = Number(req.query.numStanze);
    }
    if (req.query.numBagni) {
      filterApartment['appartamento.numBagni'] = Number(req.query.numBagni);
    }
    if (req.query.terrazzo !== undefined) {
      filterApartment['appartamento.terrazzo'] = req.query.terrazzo === 'true';
    }
    if (req.query.classeEnergetica) {
      filterApartment['appartamento.classeEnergetica'] = req.query.classeEnergetica;
    }

    // Filtri sui metri quadri
    if (req.query.mqMin || req.query.mqMax) {
      filterApartment['appartamento.mqTot'] = {};
      if (req.query.mqMin) {
        filterApartment['appartamento.mqTot']['$gte'] = Number(req.query.mqMin);
      }
      if (req.query.mqMax) {
        filterApartment['appartamento.mqTot']['$lte'] = Number(req.query.mqMax);
      }
    }

    // Filtri per le camere (usando $elemMatch per filtrare elementi dell'array)
    if (req.query.prezzoMin || req.query.prezzoMax || req.query.tipoCam) {
      const filterCamera = {};
      if (req.query.prezzoMin) {
        filterCamera['prezzo'] = { $gte: Number(req.query.prezzoMin) };
      }
      if (req.query.prezzoMax) {
        if (filterCamera['prezzo']) {
          filterCamera['prezzo']['$lte'] = Number(req.query.prezzoMax);
        } else {
          filterCamera['prezzo'] = { $lte: Number(req.query.prezzoMax) };
        }
      }
      if (req.query.tipoCam) {
        filterCamera['tipo'] = req.query.tipoCam;
      }

      // Almeno una camera deve soddisfare tutti i criteri
      filterApartment['appartamento.camere'] = { $elemMatch: filterCamera };
    }

    // Esegue la query
    const annunci = await Annuncio
      .find(filterApartment)
      .populate('appartamento')
      .sort({ dataPubbl: -1 });

    res.status(200).json({
      success: true,
      count: annunci.length,
      data: annunci,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnunciAttivi,
  getAnnuncioById,
  searchAnnunciWithFilters,
};
