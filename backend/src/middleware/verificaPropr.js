// src/middleware/verificaPropr.js — Verifica proprietario Appartamento
//
// Controlla che l'utente loggato sia il proprietario (amministratore) dell'appartamento
// che sta tentando di visualizzare, modificare o eliminare.

const Appartamento = require('../models/Appartamento');

/**
 * Middleware per verificare la proprietà su un appartamento.
 * Assume che:
 * - req.user.id (o req.user._id) contiene l'ID dell'utente autenticato (da req.user del JWT)
 * - req.params.id contiene l'ID dell'appartamento
 * 
 * Se l'utente non è il proprietario, ritorna 403 Forbidden.
 */
async function verificaProprietario(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID appartamento non fornito',
      });
    }

    // Estrai l'ID utente dal token (il middleware auth.js ha già caricato req.user)
    const utenteId = req.user.id || req.user._id;

    if (!utenteId) {
      return res.status(401).json({
        success: false,
        message: 'Utente non autenticato correttamente',
      });
    }

    // Recupera l'appartamento dal database
    const appartamento = await Appartamento.findById(id);

    if (!appartamento) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato',
      });
    }

    // Verifica che l'amministratore dell'appartamento sia l'utente loggato
    // Confronta le stringhe in caso di ObjectId
    const amministratoreStr = appartamento.amministratoreId.toString();
    const utenteStr = utenteId.toString();

    if (amministratoreStr !== utenteStr) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questo appartamento. Sei un proprietario diverso.',
      });
    }

    // Se il controllo passa, carica l'appartamento in req, così il controller può accedervi
    req.appartamento = appartamento;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nella verifica della proprietà',
      error: error.message,
    });
  }
}

module.exports = {
  verificaProprietario,
};
