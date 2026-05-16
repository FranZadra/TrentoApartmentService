// src/controllers/controllerAppartamenti.js — Controller CRUD Appartamento
//
// Gestisce tutte le operazioni su Appartamento: creazione, lettura, aggiornamento, eliminazione.
// Si interfaccia con il model Mongoose e genera risposte REST.

const Appartamento = require('../models/Appartamento');
const Annuncio = require('../models/Annuncio');

/**
 * Crea un nuovo appartamento.
 * Body atteso:
 *   {
 *     indirizzo: { via, numero, città, CAP, Stato },
 *     mqTot: Number,
 *     perStudenti: Boolean,
 *     numStanze: Number,
 *     numBagni: Number,
 *     foto: [String],
 *     terrazzo: Boolean,
 *     lavatrice: Boolean,
 *     classeEnergetica: String,
 *     amministratoreId: String
 *   }
 */
async function creaAppartamento(req, res) {
  try {
    const data = req.body;

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
      amministratoreId: data.amministratoreId,
      posizione: data.posizione,
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


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function getAppartamenti(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filters = {};
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

/**
 * Recupera un appartamento specifico per ID.
 * Params: id (MongoDB ObjectId)
 */
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

/**
 * Aggiorna un appartamento.
 * Params: id (MongoDB ObjectId)
 * Body: campi da aggiornare (tutti opzionali)
 */
async function aggiornaAppartamento(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appartamento = await Appartamento.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
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

/**
 * Elimina un appartamento.
 * Params: id (MongoDB ObjectId)
 * Nota: Se l'appartamento ha annunci associati, è consigliabile eliminare/archiviare gli annunci prima.
 */
async function eliminaAppartamento(req, res) {
  try {
    const { id } = req.params;

    // Verifica se ci sono annunci associati (opzionale, a seconda della policy)
    const annunciAssociati = await Annuncio.countDocuments({ appartamentoId: id });

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

/**
 * Recupera tutti gli appartamenti gestiti dall'amministratore (proprietario) specificato.
 * Params: amministratoreId
 * Query: page, limit (come getAllApartments)
 */
async function getAppartamentiAdmin(req, res) {
  try {
    const { amministratoreId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Appartamento.countDocuments({ amministratoreId });
    const appartamenti = await Appartamento.find({ amministratoreId })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Appartamenti dell\'amministratore recuperati',
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
      message: 'Errore nel recupero degli appartamenti dell\'amministratore',
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
  getAppartamentiAdmin,
};
