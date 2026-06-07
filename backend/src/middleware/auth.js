// Middleware per autenticazione JWT

const jwt = require('jsonwebtoken');

// Verifica la validità del token
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

function autenticaTokenOpzionale(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    req.user = jwt.verify(token, secret);
  } catch (error) {
    req.user = undefined;
  }

  return next();
}

module.exports = {
  autenticaToken,
  autenticaTokenOpzionale,
};
