// src/controllers/bolletteController.js — Gestione bollette
//
// US27: caricamento bollette da parte dell'amministratore
// US20: visualizzazione bollette da parte dell'inquilino

const Bolletta = require('../models/Bolletta');
const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');
const User = require('../models/User');

// Ricava l'ID utente dal payload JWT (il token usa 'sub' come campo principale)
function estraiUserId(req) {
  return req.user?.sub || req.user?.id || req.user?._id;
}

// Quando a un utente viene assegnato un contratto diventa 'utente verificato';
// alcuni record/flussi più vecchi usano ancora 'inquilino'. Per individuare un
// inquilino dobbiamo accettare entrambi i ruoli.
function isRuoloInquilino(utente) {
  return utente?.ruolo === 'utente verificato' || utente?.ruolo === 'inquilino';
}

// Il model Contratto usa 'idInquilini' (array), ma in DB sopravvivono contratti
// col vecchio campo 'idInquilino' (singolare). Cerchiamo l'inquilino su entrambi,
// coerentemente con quanto fa il controller della gestione interna.
function filtroContrattoInquilino(userId) {
  return { $or: [{ idInquilini: userId }, { idInquilino: userId }] };
}

// Verifica che l'appartamento esista e appartenga all'amministratore loggato
async function verificaAdminAppartamento(appartamentoId, adminId) {
  const appartamento = await Appartamento.findOne({
    _id: appartamentoId,
    amministratoreId: adminId,
  });
  return appartamento;
}

// ── US27: carica una nuova bolletta con PDF allegato ──────────────────────────

const caricaBolletta = async (req, res) => {
  try {
    const adminId = estraiUserId(req);
    if (!adminId) return res.status(401).json({ error: 'Utente non autenticato' });

    const admin = await User.findById(adminId);
    if (!admin || admin.ruolo !== 'amministratore') {
      return res.status(403).json({ error: 'Solo gli amministratori possono caricare bollette' });
    }

    const { appartamentoId } = req.params;
    const appartamento = await verificaAdminAppartamento(appartamentoId, adminId);
    if (!appartamento) {
      return res.status(403).json({ error: 'Non sei autorizzato a gestire questo appartamento' });
    }

    const { utenza, periodoInizio, periodoFine, importo } = req.body;

    if (!utenza || !periodoInizio || !periodoFine || importo === undefined) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti: utenza, periodoInizio, periodoFine, importo' });
    }

    // Il file PDF è opzionale ma, se presente, deve essere un PDF
    let pdfData = null;
    let pdfNomeFile = null;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Il file allegato deve essere in formato PDF' });
      }
      pdfData = req.file.buffer;
      pdfNomeFile = req.file.originalname;
    }

    const bolletta = await Bolletta.create({
      idAppartamento: appartamentoId,
      utenza,
      periodoInizio: new Date(periodoInizio),
      periodoFine: new Date(periodoFine),
      importo: Number(importo),
      pdfData,
      pdfNomeFile,
    });

    // Restituisce la bolletta senza il buffer PDF (troppo pesante nella risposta JSON)
    const risposta = bolletta.toObject();
    delete risposta.pdfData;

    return res.status(201).json({ success: true, data: risposta });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errori = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ errors: errori });
    }
    console.error('Errore caricaBolletta:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ── US27: lista bollette di un appartamento (vista amministratore) ─────────────

const getBolletteAdmin = async (req, res) => {
  try {
    const adminId = estraiUserId(req);
    if (!adminId) return res.status(401).json({ error: 'Utente non autenticato' });

    const admin = await User.findById(adminId);
    if (!admin || admin.ruolo !== 'amministratore') {
      return res.status(403).json({ error: 'Accesso non autorizzato' });
    }

    const { appartamentoId } = req.params;
    const appartamento = await verificaAdminAppartamento(appartamentoId, adminId);
    if (!appartamento) {
      return res.status(403).json({ error: 'Non sei autorizzato a gestire questo appartamento' });
    }

    // Esclude il campo pdfData dal risultato per non inviare buffer pesanti
    const bollette = await Bolletta.find({ idAppartamento: appartamentoId })
      .select('-pdfData')
      .sort({ periodoFine: -1 });

    return res.status(200).json({ success: true, data: bollette });
  } catch (error) {
    console.error('Errore getBolletteAdmin:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ── US27: segna una bolletta come pagata (aggiornaStatoB) ──────────────────────

const segnaPagata = async (req, res) => {
  try {
    const adminId = estraiUserId(req);
    if (!adminId) return res.status(401).json({ error: 'Utente non autenticato' });

    const admin = await User.findById(adminId);
    if (!admin || admin.ruolo !== 'amministratore') {
      return res.status(403).json({ error: 'Accesso non autorizzato' });
    }

    const { bollettaId } = req.params;
    const bolletta = await Bolletta.findById(bollettaId);
    if (!bolletta) return res.status(404).json({ error: 'Bolletta non trovata' });

    // Verifica che l'appartamento della bolletta appartenga all'admin loggato
    const appartamento = await verificaAdminAppartamento(bolletta.idAppartamento, adminId);
    if (!appartamento) {
      return res.status(403).json({ error: 'Non sei autorizzato a modificare questa bolletta' });
    }

    bolletta.pagata = true;
    await bolletta.save();

    const risposta = bolletta.toObject();
    delete risposta.pdfData;

    return res.status(200).json({ success: true, data: risposta });
  } catch (error) {
    console.error('Errore segnaPagata:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ── US27: elimina una bolletta ─────────────────────────────────────────────────

const eliminaBolletta = async (req, res) => {
  try {
    const adminId = estraiUserId(req);
    if (!adminId) return res.status(401).json({ error: 'Utente non autenticato' });

    const admin = await User.findById(adminId);
    if (!admin || admin.ruolo !== 'amministratore') {
      return res.status(403).json({ error: 'Accesso non autorizzato' });
    }

    const { bollettaId } = req.params;
    const bolletta = await Bolletta.findById(bollettaId);
    if (!bolletta) return res.status(404).json({ error: 'Bolletta non trovata' });

    const appartamento = await verificaAdminAppartamento(bolletta.idAppartamento, adminId);
    if (!appartamento) {
      return res.status(403).json({ error: 'Non sei autorizzato a eliminare questa bolletta' });
    }

    await bolletta.deleteOne();

    return res.status(200).json({ success: true, message: 'Bolletta eliminata' });
  } catch (error) {
    console.error('Errore eliminaBolletta:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ── US20: lista bollette per l'inquilino loggato ───────────────────────────────
//
// Restituisce le bollette dell'appartamento in cui l'inquilino ha un contratto
// attivo o in chiusura. Include anche i dati aggregati per i grafici dei consumi.

const getBolletteInquilino = async (req, res) => {
  try {
    const inquilinoId = estraiUserId(req);
    if (!inquilinoId) return res.status(401).json({ error: 'Utente non autenticato' });

    const inquilino = await User.findById(inquilinoId);
    if (!inquilino || !isRuoloInquilino(inquilino)) {
      return res.status(403).json({ error: 'Solo gli inquilini possono accedere a questa sezione' });
    }

    // Recupera il contratto attivo o in chiusura dell'inquilino
    const contratto = await Contratto.findOne({
      ...filtroContrattoInquilino(inquilinoId),
      stato: { $in: ['attivo', 'in chiusura'] },
    });

    if (!contratto) {
      return res.status(200).json({ success: true, data: [], grafici: [] });
    }

    const bollette = await Bolletta.find({ idAppartamento: contratto.idAppartamento })
      .select('-pdfData')
      .sort({ periodoFine: -1 });

    // Dati aggregati per i grafici: importo per periodo raggruppato per utenza
    const grafici = costruisciDatiGrafici(bollette);

    return res.status(200).json({ success: true, data: bollette, grafici });
  } catch (error) {
    console.error('Errore getBolletteInquilino:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Trasforma la lista bollette in una struttura pronta per vue-chartjs:
// { labels: [...mesi], datasets: [{ label: 'luce', data: [...importi] }, ...] }
function costruisciDatiGrafici(bollette) {
  if (!bollette.length) return { labels: [], datasets: [] };

  // Ordina per data di fine periodo crescente (le più vecchie prima, per il grafico)
  const ordinate = [...bollette].sort(
    (a, b) => new Date(a.periodoFine) - new Date(b.periodoFine)
  );

  // Raccoglie tutte le etichette di periodo univoche (formato: "MM/YYYY")
  const labelsSet = new Set();
  ordinate.forEach((b) => {
    const d = new Date(b.periodoFine);
    labelsSet.add(`${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
  });
  const labels = [...labelsSet];

  // Per ogni tipo di utenza costruisce un dataset con i valori per ogni periodo
  const utenze = ['luce', 'gas', 'acqua'];
  const colori = { luce: '#f59e0b', gas: '#3b82f6', acqua: '#06b6d4' };

  const datasets = utenze
    .map((u) => {
      const data = labels.map((label) => {
        const [mm, yyyy] = label.split('/');
        const voce = ordinate.find((b) => {
          const d = new Date(b.periodoFine);
          return (
            b.utenza === u &&
            String(d.getMonth() + 1).padStart(2, '0') === mm &&
            String(d.getFullYear()) === yyyy
          );
        });
        return voce ? voce.importo : null;
      });
      // Esclude il dataset se non ci sono valori per questa utenza
      const haValori = data.some((v) => v !== null);
      if (!haValori) return null;
      return {
        label: u.charAt(0).toUpperCase() + u.slice(1),
        data,
        backgroundColor: colori[u] + 'cc',
        borderColor: colori[u],
        borderWidth: 2,
        borderRadius: 4,
        spanGaps: true,
      };
    })
    .filter(Boolean);

  return { labels, datasets };
}

// ── Download PDF ───────────────────────────────────────────────────────────────
//
// Accessibile sia dall'amministratore proprietario sia dall'inquilino con contratto attivo.

const scaricaPdf = async (req, res) => {
  try {
    const userId = estraiUserId(req);
    if (!userId) return res.status(401).json({ error: 'Utente non autenticato' });

    const utente = await User.findById(userId);
    if (!utente) return res.status(404).json({ error: 'Utente non trovato' });

    const { bollettaId } = req.params;
    const bolletta = await Bolletta.findById(bollettaId);
    if (!bolletta) return res.status(404).json({ error: 'Bolletta non trovata' });

    if (!bolletta.pdfData) {
      return res.status(404).json({ error: 'Nessun PDF allegato a questa bolletta' });
    }

    // Verifica autorizzazione: admin proprietario o inquilino con contratto attivo/in chiusura
    const isAdmin = utente.ruolo === 'amministratore';

    if (isAdmin) {
      const appartamento = await verificaAdminAppartamento(bolletta.idAppartamento, userId);
      if (!appartamento) return res.status(403).json({ error: 'Non autorizzato' });
    } else if (isRuoloInquilino(utente)) {
      const contratto = await Contratto.findOne({
        ...filtroContrattoInquilino(userId),
        idAppartamento: bolletta.idAppartamento,
        stato: { $in: ['attivo', 'in chiusura'] },
      });
      if (!contratto) return res.status(403).json({ error: 'Non hai un contratto attivo per questo appartamento' });
    } else {
      return res.status(403).json({ error: 'Accesso non autorizzato' });
    }

    const nomeFile = bolletta.pdfNomeFile || `bolletta-${bollettaId}.pdf`;
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${nomeFile}"`);
    return res.send(bolletta.pdfData);
  } catch (error) {
    console.error('Errore scaricaPdf:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  caricaBolletta,
  getBolletteAdmin,
  segnaPagata,
  eliminaBolletta,
  getBolletteInquilino,
  scaricaPdf,
};
