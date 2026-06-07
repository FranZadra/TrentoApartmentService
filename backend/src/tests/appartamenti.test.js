// Test delle API per gli appartamenti (routesAppartamenti)

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const Appartamento = require('../models/Appartamento');
const Annuncio = require('../models/annuncio');

// Variabili di test
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_ID = '64b000000000000000000001';
const ALTRO_ADMIN_ID = '64b000000000000000000099';
const APP_ID = '64b000000000000000000002';

const tokenAdmin = jwt.sign(
 { sub: ADMIN_ID, ruolo: 'amministratore' },
 JWT_SECRET,
 { expiresIn: '1h' }
);

// Fixture 
const appartamentoFake = {
 _id: APP_ID,
 amministratoreId: ADMIN_ID,
 indirizzo: { via: 'Via Roma', numero: '1', città: 'Trento', CAP: '38100', Stato: 'IT' },
 mqTot: 70,
 numStanze: 3,
 numBagni: 1,
 terrazzo: false,
 lavatrice: true,
 classeEnergetica: 'C',
 perStudenti: true,
 foto: [],
 toObject() { return { ...this }; },
};

describe('Suite di test appartamenti', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/v2/appartamenti', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.50
  test('restituisce 401 senza token', async () => {
    const res = await request(app).post('/api/v2/appartamenti').send({});
    expect(res.status).toBe(401);
  });

  // TEST CASE N.43
  test('crea un nuovo appartamento e restituisce 201', async () => {
    jest.spyOn(Appartamento.prototype, 'save').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .post('/api/v2/appartamenti')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        indirizzo: { via: 'Via Roma', numero: '1', città: 'Trento', CAP: '38100', Stato: 'IT' },
        mqTot: 70,
        numStanze: 3,
        numBagni: 1,
        classeEnergetica: 'C',
        perStudenti: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
  });

  describe('PUT /api/v2/appartamenti/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.47
  test('restituisce 403 se l\'appartamento non appartiene all\'admin', async () => {
    // Il middleware verificaProprietario trova l'appartamento con un altro proprietario e blocca l'accesso
    jest.spyOn(Appartamento, 'findById').mockResolvedValue({
      ...appartamentoFake,
      amministratoreId: ALTRO_ADMIN_ID,
    });

    const res = await request(app)
      .put(`/api/v2/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ numStanze: 4 });


    expect(res.status).toBe(403);
  });

  // TEST CASE N.44
  test('aggiorna l\'appartamento e restituisce 200', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Appartamento, 'findByIdAndUpdate').mockResolvedValue({
      ...appartamentoFake,
      numStanze: 4,
    });

    const res = await request(app)
      .put(`/api/v2/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ numStanze: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  });

  describe('DELETE /api/v2/appartamenti/:id', () => {
  afterEach(() => jest.restoreAllMocks());
  
  // TEST CASE N.46
  test('elimina l\'appartamento e restituisce 200', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .delete(`/api/v2/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // TEST CASE N.96
  test('eliminazione appartamento con warning se esistono annunci associati', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(2);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .delete(`/api/v2/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.warnings).toMatch(/2 annunci/);
  });

  // TEST CASE N.97
  test('restituisce 404 se l\'appartamento non esiste', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v2/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
  });
});
