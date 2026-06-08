// Test delle API di autenticazione e verifica identità (usersRoutes)

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');

// Variabili di test
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const UTENTE_BASE_ID = '64d000000000000000000001';

const tokenUtenteBase = jwt.sign(
  { sub: UTENTE_BASE_ID, ruolo: 'utente base' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Suite di test autenticazione e verifica identità', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/users/register', () => {
    // TEST CASE N.1
    test('Registrazione fallisce se l\'indirizzo email è malformato', async () => {
      const res = await request(app)
        .post('/api/v2/users/register')
        .send({
          nome: 'Glen',
          cognome: 'Myers',
          email: 'glenmyers/gmail.com', // formato non valido
          password: 'pwd123',
          ruolo: 'utente base'
        });

      expect(res.status).toBe(400);
      expect(res.body.messaggio).toMatch(/email/i);
    });

    // TEST CASE N.3
    test('Registrazione fallisce con campo nome vuoto ', async () => {
      const res = await request(app)
        .post('/api/v2/users/register')
        .send({
          nome: '   ',
          cognome: 'Myers',
          email: 'glenmyers@gmail.com',
          password: 'pwd123',
          ruolo: 'utente base'
        });

      expect(res.status).toBe(400);
      expect(res.body.messaggio).toContain('Nome: campo obbligatorio mancante');
    });

    // TEST CASE N.9
    test('Registrazione Amministratore fallisce se di tipo pubblico e non viene fornita la P.IVA', async () => {
      const res = await request(app)
        .post('/api/v2/users/register')
        .send({
          nome: 'Claudio',
          cognome: 'Rossi',
          email: 'claudio.admin@tas.it',
          password: 'securePassword123',
          ruolo: 'amministratore',
          telefono: '1234567890',
          privato: false
          // Partita IVA mancante, obbligatoria per amministratori non privati
        });

      expect(res.status).toBe(400);
      expect(res.body.messaggio).toContain('Partita IVA obbligatoria per account agenzia');
    });

    // TEST CASE N.12
    test('Registrazione Dipendente Comunale fallisce se mancano dipartimento o ruolo interno', async () => {
      const res = await request(app)
        .post('/api/v2/users/register')
        .send({
          nome: 'Laura',
          cognome: 'Bianchi',
          email: 'laura.comune@trento.it',
          password: 'securePassword123',
          ruolo: 'dipendente comune'
          // Campi ruoloDipendente e dipartimento omessi
        });

      expect(res.status).toBe(400);
      expect(res.body.messaggio).toContain('Ruolo: campo obbligatorio per dipendenti comunali');
    });
  });

  describe('POST /api/v2/users/login', () => {
    // TEST CASE N.15
    test('Login con successo restituisce un token JWT valido e i dati utente', async () => {
      const passwordHashata = await bcrypt.hash('pwd123Valid', 10);
      const utenteMocked = {
        _id: '64d000000000000000000010',
        email: 'glenmyers@gmail.com',
        password: passwordHashata,
        ruolo: 'utente base'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(utenteMocked);

      const res = await request(app)
        .post('/api/v2/users/login')
        .send({
          email: 'glenmyers@gmail.com',
          password: 'pwd123Valid'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.utente.email).toBe('glenmyers@gmail.com');
    });

    // TEST CASE N.14
    test('Login fallisce con password errata', async () => {
      const passwordHashata = await bcrypt.fn ? null : await bcrypt.hash('veraPassword123', 10);
      const utenteMocked = {
        _id: '64d000000000000000000010',
        email: 'glenmyers@gmail.com',
        password: passwordHashata,
        ruolo: 'utente base'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(utenteMocked);

      const res = await request(app)
        .post('/api/v2/users/login')
        .send({
          email: 'glenmyers@gmail.com',
          password: 'passwordSbagliata'
        });

      // Il sistema deve rispondere con un errore generico di autorizzazione per evitare di rivelare se l'email esiste o meno
      expect(res.status).toBe(401);
      expect(res.body.messaggio).toMatch("Password non valida");
    });
  });

  describe('PUT /api/v2/users/verifica-identita', () => {
    // TEST CASE N.51
    test('Verifica identità con successo per utente base', async () => {
      const utenteFakeBase = {
        _id: UTENTE_BASE_ID,
        nome: 'Glen',
        cognome: 'Myers',
        email: 'glenmyers@gmail.com',
        ruolo: 'utente base',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findById').mockResolvedValue(utenteFakeBase);

      const res = await request(app)
        .put('/api/v2/users/verifica-identita')
        .set('Authorization', `Bearer ${tokenUtenteBase}`);

      expect(res.status).toBe(200);
      expect(utenteFakeBase.ruolo).toBe('utente verificato');
      expect(utenteFakeBase.save).toHaveBeenCalled();
      expect(res.body.utente.ruolo).toBe('utente verificato');
    });

    // TEST CASE N.52
    test('Verifica identità non altera il ruolo se l\'utente è già avanzato', async () => {
      const utenteFakeAdmin = {
        _id: '64d000000000000000000999',
        nome: 'Marco',
        cognome: 'Rossi',
        email: 'admin@tas.it',
        ruolo: 'amministratore',
        save: jest.fn()
      };

      jest.spyOn(User, 'findById').mockResolvedValue(utenteFakeAdmin);
      const tokenAdmin = jwt.sign({ sub: utenteFakeAdmin._id, ruolo: 'amministratore' }, JWT_SECRET);

      const res = await request(app)
        .put('/api/v2/users/verifica-identita')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
      expect(utenteFakeAdmin.ruolo).toBe('amministratore'); // Invariato
      expect(utenteFakeAdmin.save).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v2/users/password/forgot', () => {  
    // TEST CASE N.57
    test('Richiesta reset restituisce 200 con messaggio generico per privacy ', async () => {
      // Sia che l'utente esista o meno, l'esito deve essere mascherarato per motivi di sicurezza e privacy 
      jest.spyOn(User, 'findOne').mockResolvedValue(null); // Utente non trovato

      const res = await request(app)
        .post('/api/v2/users/password/forgot')
        .send({ email: 'inesistente@gmail.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('messaggio'); 
    });
  });

  describe('POST /api/v2/users/password/reset', () => {
    // TEST CASE N.59
    test('Tentativo reset password fallisce se la password è inferiore a 6 caratteri', async () => {
      const res = await request(app)
        .post('/api/v2/users/password/reset')
        .send({
          token: 'rawTokenEsempio123',
          password: '123' // Troppo corta
        });

      expect(res.status).toBe(400);
      expect(res.body.messaggio).toBe('La password deve contenere almeno 6 caratteri');
    });
  });
});