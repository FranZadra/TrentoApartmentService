const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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
    // Campi dipendente comunale
    ruoloDipendente,
    dipartimento,
  } = req.body;

  // --- Validazione campi comuni obbligatori ---
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

  // --- Validazione formato email ---
  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  // --- Validazione ruolo ---
  const ruoloNormalizzato = ruolo || 'utente';
  if (!RUOLI_VALIDI.includes(ruoloNormalizzato)) {
    return res.status(400).json({ messaggio: `Ruolo non valido: ${ruoloNormalizzato}` });
  }

  // --- Validazioni specifiche per ruolo ---
  if (ruoloNormalizzato === 'amministratore') {
    // privato deve essere esplicitamente boolean
    if (typeof privato !== 'boolean') {
      return res.status(400).json({ messaggio: 'Tipo account (privato/agenzia) obbligatorio per amministratori' });
    }
    // Se è un'agenzia, la partita IVA è obbligatoria e deve essere 11 cifre
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

  // --- Email già registrata ---
  const utenteEsistente = await User.findOne({ email: email.toLowerCase() });
  if (utenteEsistente) {
    return res.status(409).json({ messaggio: 'Email già in uso' });
  }

  // --- Hashing password ---
  const passwordHashata = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // --- Costruzione documento utente ---
  // I campi specifici per ruolo vengono aggiunti solo se pertinenti,
  // così il documento MongoDB rimane pulito
  const datiUtente = {
    nome: nome.trim(),
    cognome: cognome.trim(),
    email: email.toLowerCase().trim(),
    password: passwordHashata,
    ruolo: ruoloNormalizzato,
  };

  if (ruoloNormalizzato === 'amministratore') {
    datiUtente.privato = privato;
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

  // --- Generazione JWT ---
  const token = jwt.sign(
    {
      sub: nuovoUtente._id.toString(),
      email: nuovoUtente.email,
      ruolo: nuovoUtente.ruolo,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // --- Risposta 201 ---
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

  // --- Validazione campi obbligatori ---
  if (!email) {
    return res.status(400).json({ messaggio: 'Email: campo obbligatorio mancante' });
  }
  if (!password) {
    return res.status(400).json({ messaggio: 'Password: campo obbligatorio mancante' });
  }

  // --- Validazione formato email ---
  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  // --- Ricerca utente per email ---
  const utente = await User.findOne({ email: email.toLowerCase() });
  if (!utente) {
    return res.status(401).json({ messaggio: 'Utente non trovato' });
  }

  // --- Verifica password ---
  const passwordValida = await bcrypt.compare(password, utente.password);
  if (!passwordValida) {
    return res.status(401).json({ messaggio: 'Password non valida' });
  }

  // --- Generazione JWT ---
  const token = jwt.sign(
    {
      sub: utente._id.toString(),
      email: utente.email,
      ruolo: utente.ruolo,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // --- Risposta 200 ---
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

const verificaIdentita = async (req, res) => {
  try {
    // Ottieni l'ID dell'utente dal token JWT (caricato dal middleware autenticaToken)
    const userId = req.user.sub;

    // Trova l'utente nel database
    const utente = await User.findById(userId);
    if (!utente) {
      return res.status(404).json({ messaggio: 'Utente non trovato' });
    }

    // Se l'utente è "utente base", lo aggiorna a "utente verificato"
    // Per altri ruoli (inquilino, amministratore, dipendente comune), non fa nulla
    if (utente.ruolo === 'utente base') {
      utente.ruolo = 'utente verificato';
      await utente.save();
    }

    // Ritorna l'utente aggiornato
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

module.exports = { register, login, verificaIdentita };