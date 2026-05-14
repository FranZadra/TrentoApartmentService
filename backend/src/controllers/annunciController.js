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
// Ricerca annunci con filtri su appartamento e camere.
// Query parameters:
//   - numStanze: numero esatto di stanze
//   - numBagni: numero esatto di bagni
//   - terrazzo: "true"
//   - classeEnergetica: classe energetica (es. A4, B, C, ecc.)
//   - mqMin / mqMax: range metri quadri
//   - prezzoMin / prezzoMax: range prezzo camera
//   - tipoCam: tipo di camera (SINGOLA/DOPPIA)
// Esempio: GET /api/v1/annunci/search/filter?numStanze=3&terrazzo=true&prezzoMin=300&prezzoMax=500
const searchAnnunciWithFilters = async (req, res, next) => {
  try {
    // Passo 1: costruisce il filtro direttamente su Appartamento.
    // Non si può filtrare su Annuncio perché il campo 'appartamento' è un ObjectId
    // referenziale (non un subdocument embedded), quindi le query tipo
    // 'appartamento.numStanze' su Annuncio.find() non funzionano.
    const filtroAppartamento = {};

    if (req.query.numStanze) {
      filtroAppartamento.numStanze = Number(req.query.numStanze);
    }
    if (req.query.numBagni) {
      filtroAppartamento.numBagni = Number(req.query.numBagni);
    }
    if (req.query.terrazzo) {
      filtroAppartamento.terrazzo = req.query.terrazzo === 'true';
    }
    if (req.query.classeEnergetica) {
      filtroAppartamento.classeEnergetica = req.query.classeEnergetica;
    }

    // Range metri quadri
    if (req.query.mqMin || req.query.mqMax) {
      filtroAppartamento.mqTot = {};
      if (req.query.mqMin) filtroAppartamento.mqTot.$gte = Number(req.query.mqMin);
      if (req.query.mqMax) filtroAppartamento.mqTot.$lte = Number(req.query.mqMax);
    }

    // Filtro sulle camere: $elemMatch garantisce che almeno una camera
    // soddisfi tutti i criteri contemporaneamente
    if (req.query.prezzoMin || req.query.prezzoMax || req.query.tipoCam) {
      const filtroCamera = {};
      if (req.query.tipoCam) {
        filtroCamera.tipo = req.query.tipoCam;
      }
      if (req.query.prezzoMin || req.query.prezzoMax) {
        filtroCamera.prezzo = {};
        if (req.query.prezzoMin) filtroCamera.prezzo.$gte = Number(req.query.prezzoMin);
        if (req.query.prezzoMax) filtroCamera.prezzo.$lte = Number(req.query.prezzoMax);
      }
      filtroAppartamento.camere = { $elemMatch: filtroCamera };
    }

    // Passo 2: trova gli appartamenti che soddisfano i criteri
    const appartamentiFiltrati = await Appartamento.find(filtroAppartamento);
    const idAppartamenti = appartamentiFiltrati.map(a => a._id);

    // Passo 3: trova gli annunci attivi che referenziano quegli appartamenti
    const annunci = await Annuncio
      .find({ stato: 'Attivo', appartamento: { $in: idAppartamenti } })
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
