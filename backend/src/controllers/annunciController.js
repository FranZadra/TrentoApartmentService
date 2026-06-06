// Logica delle API per gli annunci
// Ogni funzione:
//   1. Riceve la richiesta (req)
//   2. Interagisce con il database
//   3. Manda la risposta (res) in formato JSON


const Annuncio = require('../models/annuncio');
const Appartamento = require('../models/Appartamento');

// Normalizza un annuncio popolando correttamente i dati dell'appartamento
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

// Verifica che l'annuncio appartenga all'amministratore autenticato
const checkProprietario = async (appartamentoId, req, res) => {
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


 if (req.user.ruolo !== 'amministratore') {
   res.status(403).json({
     success: false,
     message: 'Non sei autorizzato a gestire questo annuncio',
   });
   return null;
 }


 if (appartamento.amministratoreId.toString() !== utenteId.toString()) {
 res.status(403).json({
     success: false,
     message: 'Non sei autorizzato a gestire questo annuncio',
   });
   return null;
 }


 return appartamento;
};

// GET /api/v1/annunci
// Ritorna tutti gli annunci con stato "attivo", valorizzando i dati dell'appartamento di ciascun annuncio
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
   // Passa l'errore al middleware errorHandler
   next(error);
 }
};

// GET /api/v1/annunci/:id
// Ritorna il dettaglio di un singolo annuncio
const getAnnuncioById = async (req, res, next) => {
 try {
   const annuncio = await Annuncio
     .findById(req.params.id)
     .populate('appartamento')
     .populate('appartamentoId');

   // Se l'annuncio non esiste, restituisce 404
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
// Ricerca annunci con filtri
const searchAnnunciWithFilters = async (req, res, next) => {
 try {
   // Costruzione filtro Appartamento
   const filtroAppartamento = {};

   if (req.query.numStanze) {
     filtroAppartamento.numStanze = { $gte: Number(req.query.numStanze) };
   }
   if (req.query.numBagni) {
     filtroAppartamento.numBagni = { $gte: Number(req.query.numBagni) };
   }
   if (req.query.terrazzo) {
     filtroAppartamento.terrazzo = req.query.terrazzo === 'true';
   }
   if (req.query.classeEnergetica) {
     filtroAppartamento.classeEnergetica = req.query.classeEnergetica;
   }

   if (req.query.mqMin || req.query.mqMax) {
     filtroAppartamento.mqTot = {};
     if (req.query.mqMin) filtroAppartamento.mqTot.$gte = Number(req.query.mqMin);
     if (req.query.mqMax) filtroAppartamento.mqTot.$lte = Number(req.query.mqMax);
   }

   // Filtro sulle camere per garantire che almeno una camera soddisfi tutti i criteri
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

   // Ricerca degli appartamenti che soddisfano i criteri
   const appartamentiFiltrati = await Appartamento.find(filtroAppartamento);
   const idAppartamenti = appartamentiFiltrati.map(a => a._id);

   // Ricerca degli annunci attivi che referenziano gli appartamenti
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
// Recupera l'annuncio associato a un appartamento dell'admin autenticato
const getAnnuncioByAppartamento = async (req, res, next) => {
 try {
   const appartamento = await checkProprietario(req.params.appartamentoId, req, res);
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
// Crea o aggiorna l'annuncio associato all'appartamento dell'admin autenticato
const upsertAnnuncioByAppartamento = async (req, res, next) => {
 try {
   if (req.user?.ruolo !== 'amministratore') {
     res.status(403).json({
       success: false,
       message: 'Non sei autorizzato a gestire questo annuncio',
     });
     return null;
   }

   const appartamento = await checkProprietario(req.params.appartamentoId, req, res);
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
// Aggiorna un annuncio esistente dell'amministratore autenticato
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
  const appartamento = await checkProprietario(appartamentoId, req, res);
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

// DELETE /api/v1/annunci/:id
// Elimina un annuncio esistente, verificando che appartenga all'admin autenticato.
const deleteAnnuncioById = async (req, res, next) => {
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
   const appartamento = await checkProprietario(appartamentoId, req, res);
   if (!appartamento) return;

   await Annuncio.findByIdAndDelete(annuncioEsistente._id);

   res.status(200).json({
     success: true,
     message: 'Annuncio eliminato con successo',
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
 deleteAnnuncioById,
};
