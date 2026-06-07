// Middleware per la verifica della proprietà su un appartamento

const Appartamento = require('../models/Appartamento');

// Verifica proprietàdi un appartamento
async function verificaProprietario(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID appartamento non fornito',
      });
    }

    // Estrai l'ID utente dal token
    const utenteId = req.user.id || req.user._id || req.user.sub;

    if (!utenteId) {
      return res.status(401).json({
        success: false,
        message: 'Utente non autenticato correttamente',
      });
    }

    // Recupera l'appartamento dal DB
    const appartamento = await Appartamento.findById(id);

    if (!appartamento) {
      return res.status(404).json({
        success: false,
        message: 'Appartamento non trovato',
      });
    }

    // Verifica che l'appartamento abbia un amministratore
    if (!appartamento.amministratoreId) {
      return res.status(403).json({
        success: false,
        message: 'Appartamento senza amministratore assegnato — operazione non consentita.',
      });
    }

    // Verifica che l'amministratore dell'appartamento sia l'utente loggato
    const amministratoreStr = appartamento.amministratoreId.toString();
    const utenteStr = utenteId.toString();

    if (amministratoreStr !== utenteStr) {
      return res.status(403).json({
        success: false,
        message: 'Non sei autorizzato a modificare questo appartamento.',
      });
    }

    // Carica l'appartamento in req, così il controller può accedervi
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
