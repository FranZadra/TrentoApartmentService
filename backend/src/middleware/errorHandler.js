// src/middleware/errorHandler.js — Gestione centralizzata degli errori
//
// Express riconosce questo file come error handler, centralizzato
// grazie ai 4 parametri (err, req, res, next).

const errorHandler = (err, req, res, next) => {
  console.error('Errore completo:', err);
  console.error('Errore messaggio:', err.message);
  console.error('Errore stack:', err.stack);

  // Errore di ID MongoDB non valido (es. /annunci/id-non-valido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID non valido',
    });
  }

  // Errore di validazione Mongoose (es. campo required mancante)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Errore generico del server
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
  });
};

module.exports = errorHandler;