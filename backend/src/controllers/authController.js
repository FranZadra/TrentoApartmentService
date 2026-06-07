// Controller per autenticazione

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/mailService');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 60);

const RUOLI_VALIDI = ['utente base', 'utente verificato', 'inquilino', 'amministratore', 'dipendente comune'];

const register = async (req, res) => {
  const {
    nome,
    cognome,
    email,
    password,
    ruolo,
    // Campi amministratore
    privato,
    pIVA,
    telefono,
    // Campi dipendente comunale
    ruoloDipendente,
    dipartimento,
  } = req.body;

  // Validazione campi comuni obbligatori
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ messaggio: 'Nome: campo obbligatorio mancante' });
  }
  if (!cognome || cognome.trim() === '') {
    return res.status(400).json({ messaggio: 'Cognome: campo obbligatorio mancante' });
  }
  if (!email) {
    return res.status(400).json({ messaggio: 'Email: campo obbligatorio mancante' });
  }
  if (!password || password.trim() === '') {
    return res.status(400).json({ messaggio: 'Password: campo obbligatorio mancante' });
  }

  // Validazione formato email
  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  // Validazione ruolo
  const ruoloNormalizzato = ruolo || 'utente';
  if (!RUOLI_VALIDI.includes(ruoloNormalizzato)) {
    return res.status(400).json({ messaggio: `Ruolo non valido: ${ruoloNormalizzato}` });
  }

  // Validazioni specifiche per ruolo
  if (ruoloNormalizzato === 'amministratore') {
    if (typeof privato !== 'boolean') {
      return res.status(400).json({ messaggio: 'Tipo account (privato/agenzia) obbligatorio per amministratori' });
    }
    // Il telefono è richiesto per il contatto con Whatsapp
    if (!telefono || telefono.trim() === '') {
      return res.status(400).json({ messaggio: 'Numero di telefono obbligatorio per amministratori' });
    }
    // Se è un'agenzia, la partita IVA è obbligatoria
    if (privato === false) {
      if (!pIVA || pIVA.trim() === '') {
        return res.status(400).json({ messaggio: 'Partita IVA obbligatoria per account agenzia' });
      }
      if (!/^\d{11}$/.test(pIVA.trim())) {
        return res.status(400).json({ messaggio: 'Partita IVA: deve essere composta da 11 cifre' });
      }
    }
  }

  if (ruoloNormalizzato === 'dipendente comune') {
    if (!ruoloDipendente || ruoloDipendente.trim() === '') {
      return res.status(400).json({ messaggio: 'Ruolo: campo obbligatorio per dipendenti comunali' });
    }
    if (!dipartimento || dipartimento.trim() === '') {
      return res.status(400).json({ messaggio: 'Dipartimento: campo obbligatorio per dipendenti comunali' });
    }
  }

  // Email già registrata
  const utenteEsistente = await User.findOne({ email: email.toLowerCase() });
  if (utenteEsistente) {
    return res.status(409).json({ messaggio: 'Email già in uso' });
  }

  // Hashing password con bcrypt
  const passwordHashata = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Costruzione del documento utente
  const datiUtente = {
    nome: nome.trim(),
    cognome: cognome.trim(),
    email: email.toLowerCase().trim(),
    password: passwordHashata,
    ruolo: ruoloNormalizzato,
  };

  if (ruoloNormalizzato === 'amministratore') {
    datiUtente.privato = privato;
    datiUtente.telefono = telefono.trim();
    if (privato === false) {
      datiUtente.pIVA = pIVA.trim();
    }
  }

  if (ruoloNormalizzato === 'dipendente comune') {
    datiUtente.ruoloDipendente = ruoloDipendente.trim();
    datiUtente.dipartimento = dipartimento.trim();
  }

  const nuovoUtente = new User(datiUtente);
  await nuovoUtente.save();

  // Generazione JWT token
  const token = jwt.sign(
    {
      sub: nuovoUtente._id.toString(),
      email: nuovoUtente.email,
      ruolo: nuovoUtente.ruolo,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.status(201).json({
    messaggio: 'Utente registrato con successo',
    token,
    utente: {
      id: nuovoUtente._id,
      nome: nuovoUtente.nome,
      cognome: nuovoUtente.cognome,
      email: nuovoUtente.email,
      ruolo: nuovoUtente.ruolo,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validazione campi obbligatori
  if (!email) {
    return res.status(400).json({ messaggio: 'Email: campo obbligatorio mancante' });
  }
  if (!password) {
    return res.status(400).json({ messaggio: 'Password: campo obbligatorio mancante' });
  }

  // Validazione formato email
  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  // Ricerca utente per email
  const utente = await User.findOne({ email: email.toLowerCase() });
  if (!utente) {
    return res.status(401).json({ messaggio: 'Utente non trovato' });
  }

  // Verifica password
  const passwordValida = await bcrypt.compare(password, utente.password);
  if (!passwordValida) {
    return res.status(401).json({ messaggio: 'Password non valida' });
  }

  // Generazione JWT token
  const token = jwt.sign(
    {
      sub: utente._id.toString(),
      email: utente.email,
      ruolo: utente.ruolo,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.status(200).json({
    messaggio: 'Login effettuato con successo',
    token,
    utente: {
      id: utente._id,
      nome: utente.nome,
      cognome: utente.cognome,
      email: utente.email,
      ruolo: utente.ruolo,
    },
  });
};

const richiediResetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ messaggio: 'Email: campo obbligatorio mancante' });
  }

  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  const utente = await User.findOne({ email: email.toLowerCase().trim() });

  if (!utente) {
    return res.status(200).json({
      messaggio: 'Se l’email è presente nel sistema, riceverai un messaggio con le istruzioni per il reset.',
    });
  }

  const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

  utente.passwordResetToken = tokenHash;
  utente.passwordResetExpires = expiresAt;
  await utente.save();

  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendBaseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

  // Invia email con link di reset password
  try {
    await sendPasswordResetEmail({
      to: utente.email,
      nome: utente.nome,
      resetLink,
      expiresAt,
    });
  } catch (e) {
    console.warn('Invio email reset fallito:', e && e.message ? e.message : e)
  }

  return res.status(200).json({
    messaggio: 'Se l’email è presente nel sistema, riceverai un messaggio con le istruzioni per il reset.',
  });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ messaggio: 'Token di reset mancante' });
  }

  if (!password || password.trim() === '') {
    return res.status(400).json({ messaggio: 'Password: campo obbligatorio mancante' });
  }

  if (password.length < 6) {
    return res.status(400).json({ messaggio: 'La password deve contenere almeno 6 caratteri' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const utente = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!utente) {
    return res.status(400).json({ messaggio: 'Token di reset non valido o scaduto' });
  }

  const nuovaPasswordHashata = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  utente.password = nuovaPasswordHashata;
  utente.passwordResetToken = null;
  utente.passwordResetExpires = null;
  await utente.save();

  return res.status(200).json({ messaggio: 'Password aggiornata con successo' });
};

const verificaIdentita = async (req, res) => {
  try {
    //ID dell'utente dal token JWT
    const userId = req.user.sub;

    // Trova l'utente nel DB
    const utente = await User.findById(userId);
    if (!utente) {
      return res.status(404).json({ messaggio: 'Utente non trovato' });
    }

    // Se l'utente è "utente base", lo aggiorna a "utente verificato"
    if (utente.ruolo === 'utente base') {
      utente.ruolo = 'utente verificato';
      await utente.save();
    }

    return res.status(200).json({
      messaggio: 'Verifica identità effettuata con successo',
      utente: {
        id: utente._id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        ruolo: utente.ruolo,
      },
    });
  } catch (error) {
    return res.status(500).json({ 
      messaggio: 'Errore durante la verifica identità',
      error: error.message 
    });
  }
};

module.exports = { register, login, verificaIdentita, richiediResetPassword, resetPassword };