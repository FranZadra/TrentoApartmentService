// src/controllers/statisticheController.js — Statistiche aggregate per dipendenti comunali
//
// Espone dati aggregati e anonimizzati sul mercato degli affitti a Trento (RNF10).
// Nessun dato personale viene restituito (no nomi, email o ID inquilini).

const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');

const getStatistiche = async (req, res) => {
  try {
    // Verifica ruolo: solo il dipendente comunale può accedere (ruolo già nel JWT)
    if (req.user?.ruolo !== 'dipendente comune') {
      return res.status(403).json({
        success: false,
        message: 'Accesso riservato ai dipendenti comunali',
      });
    }

    // Filtri opzionali passati via query string
    const { cap, tipoCamera, perStudenti } = req.query;

    // Filtro base sugli appartamenti
    const matchAppartamento = {};
    if (cap) matchAppartamento['indirizzo.CAP'] = cap;
    if (perStudenti !== undefined) matchAppartamento.perStudenti = perStudenti === 'true';

    // Filtro sulle camere (applicato dopo $unwind)
    const matchCamera = {};
    if (tipoCamera && ['SINGOLA', 'DOPPIA'].includes(tipoCamera)) {
      matchCamera['camere.tipo'] = tipoCamera;
    }

    // --- Aggregazione A: statistiche per CAP (prezzo €/m², occupazione) ---
    const pipelinePerCAP = [
      { $match: matchAppartamento },
      { $unwind: '$camere' },
      ...(Object.keys(matchCamera).length ? [{ $match: matchCamera }] : []),
      {
        $group: {
          _id: '$indirizzo.CAP',
          // $addToSet per contare appartamenti unici (non camere)
          appartamentiIds: { $addToSet: '$_id' },
          // Raccoglie i prezzi al m² di ogni camera (escluse camere con mq=0)
          prezziPerMq: {
            $push: {
              $cond: [
                { $gt: ['$camere.mq', 0] },
                { $divide: ['$camere.prezzo', '$camere.mq'] },
                null,
              ],
            },
          },
          camereTotali: { $sum: 1 },
          camereDisponibili: { $sum: { $cond: ['$camere.disponibile', 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          cap: '$_id',
          numAppartamenti: { $size: '$appartamentiIds' },
          // Filtra i null prima di calcolare la media
          prezzoMedioMq: {
            $avg: {
              $filter: {
                input: '$prezziPerMq',
                as: 'p',
                cond: { $ne: ['$$p', null] },
              },
            },
          },
          camereTotali: 1,
          camereDisponibili: 1,
        },
      },
      { $sort: { cap: 1 } },
    ];

    // --- Aggregazione B: distribuzione per tipo camera ---
    const pipelinePerTipo = [
      { $match: matchAppartamento },
      { $unwind: '$camere' },
      ...(Object.keys(matchCamera).length ? [{ $match: matchCamera }] : []),
      {
        $group: {
          _id: '$camere.tipo',
          count: { $sum: 1 },
          prezzoMedio: { $avg: '$camere.prezzo' },
        },
      },
      {
        $project: {
          _id: 0,
          tipo: '$_id',
          count: 1,
          prezzoMedio: { $round: ['$prezzoMedio', 2] },
        },
      },
    ];

    // --- Aggregazione C: totale appartamenti (senza unwind) ---
    const pipelineTotaleAppartamenti = [
      { $match: matchAppartamento },
      { $count: 'totale' },
    ];

    // Esecuzione parallela delle tre aggregazioni sugli appartamenti
    const [perCAP, perTipo, [totaleResult]] = await Promise.all([
      Appartamento.aggregate(pipelinePerCAP),
      Appartamento.aggregate(pipelinePerTipo),
      Appartamento.aggregate(pipelineTotaleAppartamenti),
    ]);

    const totaleAppartamenti = totaleResult?.totale ?? 0;

    // Calcolo tasso di occupazione globale e prezzo medio globale dai dati per CAP
    let camereTotaliGlobali = 0;
    let camereDisponibiliGlobali = 0;
    let sommaPrezziMq = 0;
    let conteggioPrezziMq = 0;

    for (const zona of perCAP) {
      camereTotaliGlobali += zona.camereTotali;
      camereDisponibiliGlobali += zona.camereDisponibili;
      if (zona.prezzoMedioMq != null) {
        sommaPrezziMq += zona.prezzoMedioMq;
        conteggioPrezziMq++;
      }
    }

    const tassoOccupazione =
      camereTotaliGlobali > 0
        ? parseFloat(((camereTotaliGlobali - camereDisponibiliGlobali) / camereTotaliGlobali).toFixed(4))
        : 0;

    const prezzoMedioGlobalePerMq =
      conteggioPrezziMq > 0
        ? parseFloat((sommaPrezziMq / conteggioPrezziMq).toFixed(2))
        : 0;

    // --- Query contratti: conteggio per stato + turnover ultimo anno ---
    const unAnnoFa = new Date();
    unAnnoFa.setFullYear(unAnnoFa.getFullYear() - 1);

    // Filtro contratti: se è attivo un filtro per CAP, si limita agli appartamenti filtrati
    let idAppartamentiFiltrati = null;
    if (cap || perStudenti !== undefined) {
      const appartamentiFiltrati = await Appartamento.find(matchAppartamento, '_id');
      idAppartamentiFiltrati = appartamentiFiltrati.map((a) => a._id);
    }

    const matchContratto = idAppartamentiFiltrati
      ? { idAppartamento: { $in: idAppartamentiFiltrati } }
      : {};

    const [contrattiPerStato, turnoverResult] = await Promise.all([
      Contratto.aggregate([
        { $match: matchContratto },
        { $group: { _id: '$stato', count: { $sum: 1 } } },
      ]),
      Contratto.countDocuments({
        ...matchContratto,
        stato: 'terminato',
        dataFine: { $gte: unAnnoFa },
      }),
    ]);

    // Mappa i risultati dell'aggregazione contratti in un oggetto leggibile
    const contratti = { attivi: 0, terminati: 0, inChiusura: 0 };
    for (const row of contrattiPerStato) {
      if (row._id === 'attivo') contratti.attivi = row.count;
      else if (row._id === 'terminato') contratti.terminati = row.count;
      else if (row._id === 'in chiusura') contratti.inChiusura = row.count;
    }

    // Arrotonda il prezzo medio per CAP a 2 decimali nella risposta
    const distribuzionePerCAP = perCAP.map((zona) => ({
      ...zona,
      prezzoMedioMq: zona.prezzoMedioMq != null ? parseFloat(zona.prezzoMedioMq.toFixed(2)) : null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totaleAppartamenti,
        tassoOccupazione,
        prezzoMedioGlobalePerMq,
        contratti,
        turnoverUltimoAnno: turnoverResult,
        distribuzionePerCAP,
        distribuzionePerTipo: perTipo,
      },
    });
  } catch (error) {
    console.error('Errore getStatistiche:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore nel calcolo delle statistiche',
      error: error.message,
    });
  }
};

module.exports = { getStatistiche };
