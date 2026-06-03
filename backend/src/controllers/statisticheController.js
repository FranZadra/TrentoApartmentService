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

    // --- Aggregazione A: statistiche per CAP (prezzo €/m²) ---
    // Le singole camere non vengono mai popolate nell'app, quindi il prezzo al m²
    // lo ricaviamo a livello di appartamento: canone mensile del contratto attivo
    // diviso i metri quadri totali dichiarati (mqTot).
    const pipelinePerCAP = [
      { $match: matchAppartamento },
      {
        // Aggancia il contratto attivo dell'appartamento per leggerne il canone
        $lookup: {
          from: 'contrattos',
          let: { appId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$idAppartamento', '$$appId'] }, stato: 'attivo' } },
            { $project: { canoneMensile: 1 } },
          ],
          as: 'contrattoAttivo',
        },
      },
      {
        $group: {
          _id: '$indirizzo.CAP',
          numAppartamenti: { $sum: 1 },
          // Somma e conteggio dei €/m²: consideriamo solo gli appartamenti che hanno
          // un contratto attivo (quindi un canone) e una metratura valida.
          prezzoSommaMq: {
            $sum: {
              $cond: [
                { $and: [{ $gt: [{ $size: '$contrattoAttivo' }, 0] }, { $gt: ['$mqTot', 0] }] },
                { $divide: [{ $arrayElemAt: ['$contrattoAttivo.canoneMensile', 0] }, '$mqTot'] },
                0,
              ],
            },
          },
          prezzoCountMq: {
            $sum: {
              $cond: [
                { $and: [{ $gt: [{ $size: '$contrattoAttivo' }, 0] }, { $gt: ['$mqTot', 0] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cap: '$_id',
          numAppartamenti: 1,
          prezzoSommaMq: 1,
          prezzoCountMq: 1,
          prezzoMedioMq: {
            $cond: [{ $gt: ['$prezzoCountMq', 0] }, { $divide: ['$prezzoSommaMq', '$prezzoCountMq'] }, null],
          },
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

    // Prezzo medio globale: media ponderata sui singoli appartamenti (somma dei
    // €/m² diviso il numero di appartamenti con prezzo), non media-di-medie per CAP.
    let sommaPrezziMq = 0;
    let conteggioPrezziMq = 0;
    for (const zona of perCAP) {
      sommaPrezziMq += zona.prezzoSommaMq;
      conteggioPrezziMq += zona.prezzoCountMq;
    }

    const prezzoMedioGlobalePerMq =
      conteggioPrezziMq > 0
        ? parseFloat((sommaPrezziMq / conteggioPrezziMq).toFixed(2))
        : 0;

    // Il tasso di occupazione è in attesa di ridefinizione (le camere non sono
    // popolate): lo lasciamo a 0 finché non si decide se calcolarlo per
    // appartamento o per stanza. Vedi nota US16.
    const tassoOccupazione = 0;

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

    // Lista completa dei CAP presenti, indipendente dai filtri: serve a popolare
    // la tendina di selezione CAP, che altrimenti si svuoterebbe dopo un filtro.
    const capDisponibili = (await Appartamento.distinct('indirizzo.CAP')).sort();

    // Prepara la distribuzione per CAP per la risposta: arrotonda il prezzo e
    // scarta i campi di servizio (somma/conteggio) usati solo per i calcoli.
    const distribuzionePerCAP = perCAP.map((zona) => ({
      cap: zona.cap,
      numAppartamenti: zona.numAppartamenti,
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
        capDisponibili,
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
