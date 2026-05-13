// src/middleware/auth.js — Autenticazione JWT
//
// Verifica la validità del token JWT e estrae l'utente dalla richiesta.
// Attende il token nel header Authorization: "Bearer <token>"

const jwt = require('jsonwebtoken');

/**
 * Middleware di autenticazione JWT.
 * Se il token non è valido, ritorna 401 Unauthorized.
 * Se valido, carica l'utente in req.user.
 */
function autenticaToken(req, res, next) {
  // Estrai il token dall'header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token non fornito. Usa Authorization: Bearer <token>',
    });
  }

  try {
    // Verifica e decodifica il token
    const secret = process.env.JWT_SECRET || 'your-secret-key'; // Da mettere in .env
    const decoded = jwt.verify(token, secret);

    // Carica l'utente nei dati della richiesta
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token scaduto',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Token non valido',
      error: error.message,
    });
  }
}

module.exports = {
  autenticaToken,
};
