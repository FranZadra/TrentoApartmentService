// Test delle API per le bollette (routesBollette)

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const Bolletta = require('../models/Bolletta');
const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');
const User = require('../models/User');

// Variabili di test
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_ID = '64c000000000000000000001';
const INQUILINO_ID = '64c000000000000000000002';
const APP_ID = '64c000000000000000000003';
const BOLLETTA_ID = '64c000000000000000000004';
const CONTRATTO_ID = '64c000000000000000000005';

const tokenAdmin = jwt.sign({ sub: ADMIN_ID, ruolo: 'amministratore' }, JWT_SECRET, { expiresIn: '1h' });
const tokenInquilino = jwt.sign({ sub: INQUILINO_ID, ruolo: 'inquilino' }, JWT_SECRET, { expiresIn: '1h' });

// Fixtures
const adminFake = { _id: ADMIN_ID, ruolo: 'amministratore' };
const inquilinoFake = { _id: INQUILINO_ID, ruolo: 'inquilino' };
const appartamentoFake = { _id: APP_ID, amministratoreId: ADMIN_ID };
const bollettaFake = {
 _id: BOLLETTA_ID,
 idAppartamento: APP_ID,
 utenza: 'luce',
 periodoInizio: new Date('2024-01-01'),
 periodoFine: new Date('2024-01-31'),
 importo: 120,
 pagata: false,
 pdfData: null,
 pdfNomeFile: null,
 toObject() { return { ...this }; },
 async save() { return this; },
 async deleteOne() { return {}; },
};
const contrattoFake = {
 _id: CONTRATTO_ID,
 idInquilini: [INQUILINO_ID],
 idAppartamento: APP_ID,
 stato: 'attivo',
};

describe('Suite di test bollette', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v2/bollette/:appartamentoId', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.91
  test('restituisce 401 senza token', async () => {
    const res = await request(app).post(`/api/v2/bollette/${APP_ID}`).send({});
    expect(res.status).toBe(401);
  });

  // TEST CASE N.92
  test('restituisce 403 per utente non amministratore', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(inquilinoFake);

    const res = await request(app)
      .post(`/api/v2/bollette/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenInquilino}`)
      .send({ utenza: 'luce', periodoInizio: '2024-01-01', periodoFine: '2024-01-31', importo: 120 });

    expect(res.status).toBe(403);
  });

  //TEST CASE N.75
  test('restituisce 400 se mancano campi obbligatori', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(adminFake);
    jest.spyOn(Appartamento, 'findOne').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .post(`/api/v2/bollette/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ utenza: 'luce', periodoInizio: '2024-01-01', periodoFine: '2024-01-31'}); // manca importo

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obbligatori/i);
  });

  // TEST CASE N.73
  test('crea la bolletta e restituisce 201', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(adminFake);
    jest.spyOn(Appartamento, 'findOne').mockResolvedValue(appartamentoFake);
    jest.spyOn(Bolletta, 'create').mockResolvedValue(bollettaFake);

    const res = await request(app)
      .post(`/api/v2/bollette/${APP_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ utenza: 'luce', periodoInizio: '2024-01-01', periodoFine: '2024-01-31', importo: 120, pdfData: Buffer.from('%PDF-1.4 fake content'), pdfNomeFile: 'bolletta.pdf' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pdfData).toBeUndefined(); // il buffer PDF non deve essere nella risposta
  });
  });

  describe('GET /api/v2/appartamenti/:appId/bollette', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.93
  test('restituisce 401 senza token', async () => {
    const res = await request(app).get(`/api/v2/appartamenti/${APP_ID}/bollette`);
    expect(res.status).toBe(401);
  });

    // TEST CASE N.77
  test('inquilino: restituisce bollette e dati grafici', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(inquilinoFake);
    jest.spyOn(Contratto, 'findOne').mockResolvedValue(contrattoFake);
    jest.spyOn(Bolletta, 'find').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([bollettaFake]),
    });


    const res = await request(app)
      .get(`/api/v2/appartamenti/${APP_ID}/bollette`)
      .set('Authorization', `Bearer ${tokenInquilino}`);


    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.grafici).toBeDefined();
  });
  });

  describe('PUT /api/v2/bollette/:bollettaId/paga', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.76
  test('segna la bolletta come pagata e restituisce 200', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(adminFake);
    jest.spyOn(Bolletta, 'findById').mockResolvedValue(bollettaFake);
    jest.spyOn(Appartamento, 'findOne').mockResolvedValue(appartamentoFake);


    const res = await request(app)
      .put(`/api/v2/bollette/${BOLLETTA_ID}/paga`)
      .set('Authorization', `Bearer ${tokenAdmin}`);


    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  });

  describe('GET /api/v2/bollette/:bollettaId/pdf', () => {
  afterEach(() => jest.restoreAllMocks());
  // TEST CASE N.94
  test('restituisce 404 se non c\'è PDF allegato', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(adminFake);
    jest.spyOn(Bolletta, 'findById').mockResolvedValue({ ...bollettaFake, pdfData: null });
    jest.spyOn(Appartamento, 'findOne').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .get(`/api/v2/bollette/${BOLLETTA_ID}/pdf`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });

  // TEST CASE N.78
  test('restituisce il PDF per l\'admin autorizzato', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 fake content');
    jest.spyOn(User, 'findById').mockResolvedValue(adminFake);
    jest.spyOn(Bolletta, 'findById').mockResolvedValue({
      ...bollettaFake,
      pdfData: pdfBuffer,
      pdfNomeFile: 'bolletta.pdf',
    });
    jest.spyOn(Appartamento, 'findOne').mockResolvedValue(appartamentoFake);

    const res = await request(app)
      .get(`/api/v2/bollette/${BOLLETTA_ID}/pdf`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  // TEST CASE N.95
  test('restituisce 403 per inquilino senza contratto attivo', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 fake content');
    jest.spyOn(User, 'findById').mockResolvedValue(inquilinoFake);
    jest.spyOn(Bolletta, 'findById').mockResolvedValue({ ...bollettaFake, pdfData: pdfBuffer });
    jest.spyOn(Contratto, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v2/bollette/${BOLLETTA_ID}/pdf`)
      .set('Authorization', `Bearer ${tokenInquilino}`);

    expect(res.status).toBe(403);
  });
  });
});