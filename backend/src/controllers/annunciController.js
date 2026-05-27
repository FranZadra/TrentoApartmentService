// src/controllers/annunci.controller.js — Logica delle API per gli annunci
//
// Funzioni eseguite quando il front chiama le API. 
// Ognu funzione:
//   1. Riceve la richiesta (req)
//   2. Interagisce con il database
//   3. Manda la risposta (res) in formato JSON

const Annuncio = require('../models/annuncio');
const Appartamento = require('../models/Appartamento');

const normalizeId = (value) => (value ? value.toString() : '')

const normalizeAnnuncioAppartamento = (annuncio) => {
  const obj = annuncio.toObject ? annuncio.toObject() : { ...annuncio };

  const appartamentoPopolato =
    obj.appartamento && typeof obj.appartamento === 'object' && !Array.isArray(obj.appartamento)
      ? obj.appartamento
      : null;

  const appartamentoIdPopolato =
    obj.appartamentoId && typeof obj.appartamentoId === 'object' && !Array.isArray(obj.appartamentoId)
      ? obj.appartamentoId
      : null;

  const appartamentoCompleto = appartamentoPopolato || appartamentoIdPopolato;

  if (appartamentoCompleto) {
    if (appartamentoCompleto.perStudenti !== undefined && appartamentoCompleto.perStudenti === undefined) {
      appartamentoCompleto.perStudenti = appartamentoCompleto.perStudenti;
    }

    obj.appartamento = appartamentoCompleto;
    obj.appartamentoId = appartamentoCompleto._id || obj.appartamentoId || obj.appartamento;
  } else {
    obj.appartamento = obj.appartamento || obj.appartamentoId || null;
  }

  return obj;
};

const ensureAnnuncioOwnership = async (appartamentoId, req, res) => {
  const appartamento = await Appartamento.findById(appartamentoId);

  if (!appartamento) {
    res.status(404).json({
      success: false,
      message: 'Appartamento non trovato',
    });
    return null;
  }

  const utenteId = req.user?.id || req.user?._id || req.user?.sub;
  if (!utenteId) {
    res.status(401).json({
      success: false,
      message: 'Utente non autenticato',
    });
    return null;
  }

  if (normalizeId(appartamento.amministratoreId) !== normalizeId(utenteId)) {
    res.status(403).json({
      success: false,
      message: 'Non sei autorizzato a gestire questo annuncio',
    });
    return null;
  }

  return appartamento;
};

// GET /api/v1/annunci
// Ritorna tutti gli annunci con stato "attivo", inclusi i dati dell'appartamento.
// Usato dal frontend sia per la lista che per la mappa interattiva.
const getAnnunciAttivi = async (req, res, next) => {
  try {
    const annunci = await Annuncio
      .find({ stato: 'Attivo' })
      .populate('appartamento')
      .populate('appartamentoId')
      .sort({ dataPubbl: -1 });

    const annunciResponse = annunci.map(normalizeAnnuncioAppartamento);

    res.status(200).json({
      success: true,
      count: annunci.length,
      data: annunciResponse,
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
      .populate('appartamento')
      .populate('appartamentoId');

    // Se l'annuncio non esiste, rispondiamo con 404
    if (!annuncio) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato',
      });
    }

    res.status(200).json({
      success: true,
      data: normalizeAnnuncioAppartamento(annuncio),
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
      .find({
        stato: 'Attivo',
        $or: [
          { appartamentoId: { $in: idAppartamenti } },
          { appartamento: { $in: idAppartamenti } },
        ],
      })
      .populate('appartamento')
      .populate('appartamentoId')
      .sort({ dataPubbl: -1 });

    const annunciResponse = annunci.map(normalizeAnnuncioAppartamento);

    res.status(200).json({
      success: true,
      count: annunci.length,
      data: annunciResponse,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/annunci/admin/appartamento/:appartamentoId
// Recupera l'annuncio associato a un appartamento dell'admin autenticato.
const getAnnuncioByAppartamento = async (req, res, next) => {
  try {
    const appartamento = await ensureAnnuncioOwnership(req.params.appartamentoId, req, res);
    if (!appartamento) return;

    const annuncio = await Annuncio.findOne({
      $or: [
        { appartamento: appartamento._id },
        { appartamentoId: appartamento._id },
      ],
    })
      .populate('appartamento')
      .populate('appartamentoId');

    if (!annuncio) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato',
      });
    }

    res.status(200).json({
      success: true,
      data: normalizeAnnuncioAppartamento(annuncio),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/annunci/admin/appartamento/:appartamentoId
// Crea o aggiorna l'annuncio associato all'appartamento dell'admin autenticato.
const upsertAnnuncioByAppartamento = async (req, res, next) => {
  try {
    const appartamento = await ensureAnnuncioOwnership(req.params.appartamentoId, req, res);
    if (!appartamento) return;

    const isActive = req.body.attivo !== undefined ? !!req.body.attivo : req.body.stato === 'Attivo';
    const payload = {
      descrizione: req.body.descrizione,
      stato: isActive ? 'Attivo' : 'Archiviato',
      dataPubbl: isActive ? (req.body.dataPubbl || new Date()) : req.body.dataPubbl || null,
      appartamento: appartamento._id,
      appartamentoId: appartamento._id,
    };

    let annuncio = await Annuncio.findOne({
      $or: [
        { appartamento: appartamento._id },
        { appartamentoId: appartamento._id },
      ],
    });

    if (annuncio) {
      annuncio.set(payload);
      await annuncio.save();
    } else {
      annuncio = await Annuncio.create(payload);
    }

    const annuncioPopolato = await Annuncio.findById(annuncio._id)
      .populate('appartamento')
      .populate('appartamentoId');

    res.status(200).json({
      success: true,
      message: 'Annuncio salvato con successo',
      data: normalizeAnnuncioAppartamento(annuncioPopolato),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/annunci/:id
// Aggiorna un annuncio esistente, verificando che appartenga all'admin autenticato.
const updateAnnuncioById = async (req, res, next) => {
  try {
    const annuncioEsistente = await Annuncio.findById(req.params.id)
      .populate('appartamento')
      .populate('appartamentoId');

    if (!annuncioEsistente) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato',
      });
    }

    const appartamentoId = annuncioEsistente.appartamento?._id || annuncioEsistente.appartamentoId?._id || annuncioEsistente.appartamento || annuncioEsistente.appartamentoId;
    const appartamento = await ensureAnnuncioOwnership(appartamentoId, req, res);
    if (!appartamento) return;

    const isActive = req.body.attivo !== undefined ? !!req.body.attivo : req.body.stato === 'Attivo';

    annuncioEsistente.descrizione = req.body.descrizione ?? annuncioEsistente.descrizione;
    annuncioEsistente.stato = isActive ? 'Attivo' : 'Archiviato';
    annuncioEsistente.dataPubbl = isActive ? (req.body.dataPubbl || annuncioEsistente.dataPubbl || new Date()) : req.body.dataPubbl || null;
    annuncioEsistente.appartamento = appartamento._id;
    annuncioEsistente.appartamentoId = appartamento._id;

    await annuncioEsistente.save();

    const annuncioPopolato = await Annuncio.findById(annuncioEsistente._id)
      .populate('appartamento')
      .populate('appartamentoId');

    res.status(200).json({
      success: true,
      message: 'Annuncio aggiornato con successo',
      data: normalizeAnnuncioAppartamento(annuncioPopolato),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnunciAttivi,
  getAnnuncioById,
  searchAnnunciWithFilters,
  getAnnuncioByAppartamento,
  upsertAnnuncioByAppartamento,
  updateAnnuncioById,
};
