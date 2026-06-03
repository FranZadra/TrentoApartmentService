// tests/appartamenti.test.js
// Test delle API per gli appartamenti (routesAppartamenti)
// Usa supertest + mock Jest sui modelli Mongoose.

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const Appartamento = require('../models/Appartamento');
const Annuncio = require('../models/annuncio');

// ─── Token di test ────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_ID = '64b000000000000000000001';
const ALTRO_ADMIN_ID = '64b000000000000000000099';
const APP_ID = '64b000000000000000000002';

const tokenAdmin = jwt.sign(
  { sub: ADMIN_ID, ruolo: 'amministratore' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// ─── Fixture ──────────────────────────────────────────────────────────────────

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

// ─── POST /api/v1/appartamenti ────────────────────────────────────────────────

describe('POST /api/v1/appartamenti', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.50
  test('restituisce 401 senza token', async () => {
    const res = await request(app).post('/api/v1/appartamenti').send({});
    expect(res.status).toBe(401);
  });

  // TEST CASE N.42
  test('crea un nuovo appartamento e restituisce 201', async () => {
    jest.spyOn(Appartamento.prototype, 'save').mockResolvedValue(appartamentoFake);
    // Se usi la factory Appartamento.create, mock quella invece:
    // jest.spyOn(Appartamento, 'create').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .post('/api/v1/appartamenti')
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

  test('restituisce 400 se manca amministratoreId e non c\'è utente nel token', async () => {
    // Token senza sub/id
    const tokenSenzaSub = jwt.sign({ ruolo: 'amministratore' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/v1/appartamenti')
      .set('Authorization', `Bearer ${tokenSenzaSub}`)
      .send({ indirizzo: { via: 'Via Test' } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/v1/appartamenti/admin ──────────────────────────────────────────

describe('GET /api/v1/appartamenti/admin', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 401 senza token', async () => {
    const res = await request(app).get('/api/v1/appartamenti/admin');
    expect(res.status).toBe(401);
  });

  test('restituisce 200 con gli appartamenti dell\'admin', async () => {
    jest.spyOn(Appartamento, 'countDocuments').mockResolvedValue(1);
    jest.spyOn(Appartamento, 'find').mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([appartamentoFake]),
    });

    const res = await request(app)
      .get('/api/v1/appartamenti/admin')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('passa l\'amministratoreId corretto al filtro', async () => {
    const findSpy = jest.spyOn(Appartamento, 'find').mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    jest.spyOn(Appartamento, 'countDocuments').mockResolvedValue(0);

    await request(app)
      .get('/api/v1/appartamenti/admin')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({ amministratoreId: ADMIN_ID }));
  });
});

// ─── GET /api/v1/appartamenti/:id ────────────────────────────────────────────

describe('GET /api/v1/appartamenti/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 200 con i dati dell\'appartamento', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);

    const res = await request(app).get(`/api/v1/appartamenti/${APP_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(APP_ID);
  });

  test('restituisce 404 se l\'appartamento non esiste', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(null);

    const res = await request(app).get(`/api/v1/appartamenti/${APP_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/v1/appartamenti/:id ────────────────────────────────────────────

describe('PUT /api/v1/appartamenti/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 401 senza token', async () => {
    const res = await request(app).put(`/api/v1/appartamenti/${APP_ID}`).send({});
    expect(res.status).toBe(401);
  });

  // TEST CASE N.47
  test('restituisce 403 se l\'appartamento non appartiene all\'admin', async () => {
    // verificaProprietario middleware: trova l'appartamento con un altro proprietario
    jest.spyOn(Appartamento, 'findById').mockResolvedValue({
      ...appartamentoFake,
      amministratoreId: ALTRO_ADMIN_ID,
    });

    const res = await request(app)
      .put(`/api/v1/appartamenti/${APP_ID}`)
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
      .put(`/api/v1/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ numStanze: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── DELETE /api/v1/appartamenti/:id ─────────────────────────────────────────

describe('DELETE /api/v1/appartamenti/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 401 senza token', async () => {
    const res = await request(app).delete(`/api/v1/appartamenti/${APP_ID}`);
    expect(res.status).toBe(401);
  });

  test('restituisce 403 se l\'appartamento non appartiene all\'admin', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue({
      ...appartamentoFake,
      amministratoreId: ALTRO_ADMIN_ID,
    });

    const res = await request(app)
      .delete(`/api/v1/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(403);
  });

  // TEST CASE N.46
  test('elimina l\'appartamento e restituisce 200', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .delete(`/api/v1/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // TEST CASE N.98
  test('include warning se esistono annunci associati', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(2);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .delete(`/api/v1/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.warnings).toMatch(/2 annunci/);
  });

  // TEST CASE N.99
  test('restituisce 404 se l\'appartamento non esiste', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(Appartamento, 'findByIdAndDelete').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/appartamenti/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });
});