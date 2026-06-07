// Controller per la gestione degli appartamenti

const Appartamento = require('../models/Appartamento');
const Annuncio = require('../models/annuncio');
const User = require('../models/User');
const Contratto = require('../models/Contratto');
const { geocodificaIndirizzo } = require('../services/geocodingService');
const { costruisciLinkWhatsApp } = require('../services/whatsappService');

// Crea un nuovo appartamento
async function creaAppartamento(req, res) {
  try {
    const data = req.body;
    const amministratoreId = data.amministratoreId || req.user?.id || req.user?._id || req.user?.sub;

    if (!amministratoreId) {
      return res.status(400).json({
        success: false,
        message: 'amministratoreId è obbligatorio',
      });
    }

    // Geocodifica indirizzo
    const posizione = data.posizione || (await geocodificaIndirizzo(data.indirizzo));

    const appartamento = new Appartamento({
      indirizzo: data.indirizzo,
      mqTot: data.mqTot,
      perStudenti: data.perStudenti || false,
      numStanze: data.numStanze,
      numBagni: data.numBagni,
      foto: data.foto || [],
      terrazzo: data.terrazzo || false,
      lavatrice: data.lavatrice || false,
      classeEnergetica: data.classeEnergetica,
      amministratoreId,
      posizione,
    });

    const saved = await appartamento.save();

    res.status(201).json({
      success: true,
      message: 'Appartamento registrato con successo',
      data: saved,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Errore nella creazione dell\'appartamento',
      error: error.message,
    });
  }
}


// GET per gli appartamenti
async function getAppartamenti(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.proprietario === 'me') {
      const amministratoreId = req.user?.id || req.user?._id || req.user?.sub;
      if (!amministratoreId) {
        return res.status(401).json({
          success: false,
          message: 'Utente non autenticato',
        });
      }
      filters.amministratoreId = amministratoreId;
    }

    if (req.query.perStudenti !== undefined) {
      filters.perStudenti = req.query.perStudenti === 'true';
    }
    if (req.query.città) {
      filters['indirizzo.città'] = new RegExp(req.query.città, 'i');
    }

    const total = await Appartamento.countDocuments(filters);
    const appartamenti = await Appartamento.find(filters)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Appartamenti recuperati',
      data: appartamenti,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli appartamenti',
      error: error.message,
    });
  }
}

// GET appartamento tramite ID
async function getAppartamentoDaId(req, res) {
  try {
    const { id } = req.params;

    const appartamento = await Appartamento.findById(id);

    if (!appartamento) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appartamento recuperato',
      data: appartamento,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'appartamento',
      error: error.message,
    });
  }
}

// PUT per aggiornare l'appartamento
async function aggiornaAppartamento(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Aggiornamento indirizzo per aggiornare anche la mappa
    if (updates.indirizzo && updates.posizione === undefined) {
      const posizione = await geocodificaIndirizzo(updates.indirizzo);
      if (posizione) updates.posizione = posizione;
    }

    const appartamento = await Appartamento.findByIdAndUpdate(
      id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!appartamento) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appartamento aggiornato con successo',
      data: appartamento,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'appartamento',
      error: error.message,
    });
  }
}

// DELETE di un appartamento
async function eliminaAppartamento(req, res) {
  try {
    const { id } = req.params;

    // Verifica se ci sono annunci associati
    const annunciAssociati = await Annuncio.countDocuments({
      $or: [{ appartamento: id }, { appartamentoId: id }],
    });

    const appartamento = await Appartamento.findByIdAndDelete(id);

    if (!appartamento) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appartamento eliminato con successo',
      data: appartamento,
      warnings: annunciAssociati > 0 ? `Erano presenti ${annunciAssociati} annunci associati` : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'appartamento',
      error: error.message,
    });
  }
}

// GET delle informazioni di contatto dell'amministratore
async function getContattoAdmin(req, res) {
  try {
    const { id } = req.params;

    const appartamento = await Appartamento.findById(id);
    if (!appartamento) {
      return res.status(404).json({ success: false, message: 'Appartamento non trovato' });
    }

    const admin = await User.findById(appartamento.amministratoreId).select('nome cognome telefono');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Amministratore non trovato' });
    }

    const ind = appartamento.indirizzo;
    const indirizzoBreve = ind ? `${ind.via} ${ind.numero}, ${ind.città}` : 'questo appartamento';
    const messaggio = `Salve, sono interessato all'appartamento in ${indirizzoBreve}. È ancora disponibile?`;

    return res.status(200).json({
      success: true,
      data: {
        nome: admin.nome,
        cognome: admin.cognome,
        telefono: admin.telefono || null,
        linkWhatsApp: costruisciLinkWhatsApp(admin.telefono, messaggio),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Errore nel recupero del contatto amministratore',
      error: error.message,
    });
  }
}

// Associazione inquilino-appartamento con creazione/aggiornamento contratto.
// Viene fatto dall'amministratore dell'appartamento in questione
async function associaInquilino(req, res) {
  try {
    const adminId = req.user?.sub || req.user?.id || req.user?._id;
    if (req.user?.ruolo !== 'amministratore') {
      return res.status(403).json({ success: false, message: 'Solo gli amministratori possono associare un inquilino' });
    }

    const { appartamentoId } = req.params;
    const appartamento = await Appartamento.findOne({ _id: appartamentoId, amministratoreId: adminId });
    if (!appartamento) {
      return res.status(403).json({ success: false, message: 'Non sei il proprietario di questo appartamento' });
    }

    const { email, dataInizio, dataFine, canoneMensile, tipoContratto } = req.body;
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email dell\'utente obbligatoria' });
    }

    // L'utente da associare dev'essere registrato e verificato
    const utente = await User.findOne({ email: email.toLowerCase().trim() });
    if (!utente) {
      return res.status(404).json({ success: false, message: 'Nessun utente registrato con questa email' });
    }
    if (!['utente verificato', 'inquilino'].includes(utente.ruolo)) {
      return res.status(400).json({ success: false, message: 'L\'utente deve essere verificato per poter essere associato a un contratto' });
    }

    // Non deve avere altri contratti in corso
    const contrattoInCorso = await Contratto.findOne({
      $or: [{ idInquilini: utente._id }, { idInquilino: utente._id }],
      stato: { $in: ['attivo', 'in chiusura'] },
    });
    if (contrattoInCorso) {
      return res.status(409).json({ success: false, message: 'L\'utente ha già un contratto attivo' });
    }

    // Se l'appartamento ha già un contratto attivo, aggiungiamo l'utente come inquilino, altrimenti creiamo un nuovo contratto.
    let contratto = await Contratto.findOne({
      idAppartamento: appartamentoId,
      stato: { $in: ['attivo', 'in chiusura'] },
    });

    if (contratto) {
      contratto.idInquilini.push(utente._id);
      await contratto.save();
    } else {
      if (!dataInizio || !dataFine || canoneMensile === undefined || !tipoContratto) {
        return res.status(400).json({
          success: false,
          message: 'Per un nuovo contratto servono data inizio, data fine, canone mensile e tipo di contratto',
        });
      }
      contratto = await Contratto.create({
        idAppartamento: appartamentoId,
        idInquilini: [utente._id],
        dataInizio: new Date(dataInizio),
        dataFine: new Date(dataFine),
        canoneMensile: Number(canoneMensile),
        tipoContratto,
        stato: 'attivo',
      });
    }

    // L'utente diventa a tutti gli effetti un inquilino
    if (utente.ruolo !== 'inquilino') {
      utente.ruolo = 'inquilino';
      await utente.save();
    }

    return res.status(200).json({
      success: true,
      message: `${utente.nome} ${utente.cognome} associato all'appartamento`,
      data: contratto,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Errore nell\'associazione dell\'inquilino',
      error: error.message,
    });
  }
}

module.exports = {
  creaAppartamento,
  getAppartamenti,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getContattoAdmin,
  associaInquilino,
};
