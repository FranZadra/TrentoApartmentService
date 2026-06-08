// Controller per le statistiche visibili dal dipendente comunale

const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');

const getStatistiche = async (req, res) => {
  try {
    // Verifica del ruolo: solo il dipendente comunale può accedere
    if (req.user?.ruolo !== 'dipendente comune') {
      return res.status(403).json({
        success: false,
        message: 'Accesso riservato ai dipendenti comunali',
      });
    }

    const { cap, tipoCamera, perStudenti } = req.query;

    // Filtro base sugli appartamenti
    const matchAppartamento = {};
    if (cap) matchAppartamento['indirizzo.CAP'] = cap;
    if (perStudenti !== undefined) matchAppartamento.perStudenti = perStudenti === 'true';

    const matchCamera = {};
    if (tipoCamera && ['SINGOLA', 'DOPPIA'].includes(tipoCamera)) {
      matchCamera['camere.tipo'] = tipoCamera;
    }

    // 1. Statistiche per CAP (prezzo €/m²)
    const pipelinePerCAP = [
      { $match: matchAppartamento },
      {
        // Aggancia il contratto attivo dell'appartamento per leggerne il prezzo
        $lookup: {
          from: 'Contratti',
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
          // Somma e conteggio dei €/m²: consideriamo solo gli appartamenti che hanno un contratto attivo e una metratura valida.
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

    // 2. Distribuzione per tipo camera
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

    // 3. Totale appartamenti
    const pipelineTotaleAppartamenti = [
      { $match: matchAppartamento },
      { $count: 'totale' },
    ];

    const [perCAP, perTipo, [totaleResult]] = await Promise.all([
      Appartamento.aggregate(pipelinePerCAP),
      Appartamento.aggregate(pipelinePerTipo),
      Appartamento.aggregate(pipelineTotaleAppartamenti),
    ]);

    const totaleAppartamenti = totaleResult?.totale ?? 0;

    // 4. Prezzo medio globale: media ponderata sui singoli appartamenti
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


    const tassoOccupazione = 0;

    const unAnnoFa = new Date();
    unAnnoFa.setFullYear(unAnnoFa.getFullYear() - 1);

    // Filtro contratti per CAP
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

    const contratti = { attivi: 0, terminati: 0, inChiusura: 0 };
    for (const row of contrattiPerStato) {
      if (row._id === 'attivo') contratti.attivi = row.count;
      else if (row._id === 'terminato') contratti.terminati = row.count;
      else if (row._id === 'in chiusura') contratti.inChiusura = row.count;
    }

    // Lista dei CAP presenti
    const capDisponibili = (await Appartamento.distinct('indirizzo.CAP')).sort();

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
