const bcrypt = require('bcrypt');
const User = require('../models/User');

// Regex per validare il formato di un'email (es. "nome@dominio.com")
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Numero di "round" usati da bcrypt per l'hashing - più alto = più sicuro ma più lento
// 10 è il valore raccomandato per produzione
const BCRYPT_SALT_ROUNDS = 10;

/**
 * POST /api/v1/users/register
 * Registra un nuovo utente nel sistema.
 */
const register = async (req, res) => {
  // Estrae i campi dal corpo della richiesta
  const { nome, cognome, email, password, ruolo } = req.body;

  // --- Validazione 1: campi obbligatori ---
  // Controlla che nome, email e password siano presenti e non stringhe vuote
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ messaggio: 'Nome: campo obbligatorio mancante' });
  }
  if (!email) {
    return res.status(400).json({ messaggio: 'Email: campo obbligatorio mancante' });
  }
  if (!password || password.trim() === '') {
    return res.status(400).json({ messaggio: 'Password: campo obbligatorio mancante' });
  }

  // --- Validazione 2: formato email ---
  // Usa la regex per verificare che l'email abbia la forma corretta (es. rifiuta "user/gmail.com")
  if (!REGEX_EMAIL.test(email)) {
    return res.status(400).json({ messaggio: 'Email: formato non valido' });
  }

  // --- Validazione 3: email già registrata ---
  // Cerca nel DB un utente con la stessa email (ricerca case-insensitive grazie a lowercase:true nel modello)
  const utenteEsistente = await User.findOne({ email: email.toLowerCase() });
  if (utenteEsistente) {
    return res.status(409).json({ messaggio: 'Email già in uso' });
  }

  // --- Hashing della password ---
  // bcrypt.hash genera un hash sicuro; la password in chiaro non viene mai salvata nel DB
  const passwordHashata = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // --- Salvataggio nel DB ---
  // Crea il documento utente con la password già hashata
  const nuovoUtente = new User({
    nome: nome.trim() + ' ' + cognome.trim(),
    email: email.toLowerCase().trim(),
    password: passwordHashata,
    ruolo: ruolo || 'utente base',
  });

  await nuovoUtente.save();

  // --- Risposta 201 Created ---
  // Restituisce i dati dell'utente creato, ESCLUSA la password (anche quella hashata)
  return res.status(201).json({
    messaggio: 'Utente registrato con successo',
    utente: {
      id: nuovoUtente._id,
      nome: nuovoUtente.nome,
      email: nuovoUtente.email,
      ruolo: nuovoUtente.ruolo,
    },
  });
};

module.exports = { register };
