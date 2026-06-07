// Controller per la gestione delle bollette

const Bolletta = require('../models/Bolletta');
const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');
const User = require('../models/User');

// Estrae l'ID utente dal JWT
function estraiUserId(req) {
  return req.user?.sub || req.user?.id || req.user?._id;
}


function isRuoloInquilino(utente) {
  return utente?.ruolo === 'utente verificato' || utente?.ruolo === 'inquilino';
}


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

// Caricamento bolletta
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

    // Il file è opzionale (e in caso deve essere PDF)
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

// Lista delle bollette inerenti a un appartamento
const getBolletteAppartamento = async (req, res) => {
  try {
    const userId = estraiUserId(req);
    if (!userId) return res.status(401).json({ error: 'Utente non autenticato' });

    const utente = await User.findById(userId);
    if (!utente) return res.status(404).json({ error: 'Utente non trovato' });

    const { appId } = req.params;

    if (utente.ruolo === 'amministratore') {
      const appartamento = await verificaAdminAppartamento(appId, userId);
      if (!appartamento) {
        return res.status(403).json({ error: 'Non sei autorizzato a gestire questo appartamento' });
      }
    } else if (isRuoloInquilino(utente)) {
      const contratto = await Contratto.findOne({
        ...filtroContrattoInquilino(userId),
        idAppartamento: appId,
        stato: { $in: ['attivo', 'in chiusura'] },
      });
      if (!contratto) {
        return res.status(403).json({ error: 'Non hai un contratto attivo per questo appartamento' });
      }
    } else {
      return res.status(403).json({ error: 'Accesso non autorizzato' });
    }

    const bollette = await Bolletta.find({ idAppartamento: appId })
      .select('-pdfData')
      .sort({ periodoFine: -1 });

    const grafici = costruisciDatiGrafici(bollette);

    return res.status(200).json({ success: true, data: bollette, grafici });
  } catch (error) {
    console.error('Errore getBolletteAppartamento:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Segna una bolletta come pagata
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

// Eliminaziona bolletta
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

// Lista delle bollette per l'inquilino
function costruisciDatiGrafici(bollette) {
  if (!bollette.length) return { labels: [], datasets: [] };

  const ordinate = [...bollette].sort(
    (a, b) => new Date(a.periodoFine) - new Date(b.periodoFine)
  );

  const labelsSet = new Set();
  ordinate.forEach((b) => {
    const d = new Date(b.periodoFine);
    labelsSet.add(`${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
  });
  const labels = [...labelsSet];

  const utenze = ['luce', 'gas', 'acqua', 'elettricità'];
  const colori = { luce: '#f59e0b', gas: '#3b82f6', acqua: '#06b6d4', elettricità: '#8b5cf6' };

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

// Download del PDF della bolletta
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

    // Verifica autorizzazione: amministratore o inquilino con contratto attivo/in chiusura
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
  getBolletteAppartamento,
  segnaPagata,
  eliminaBolletta,
  scaricaPdf,
};
