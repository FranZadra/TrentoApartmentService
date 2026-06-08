// Test delle API per gli annunci (annunciRoutes)

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const Annuncio = require('../models/annuncio');
const Appartamento = require('../models/Appartamento');

// Variabili di test
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const ADMIN_ID = '64a000000000000000000001';
const ALTRO_ADMIN_ID = '64a000000000000000000099';
const APPARTAMENTO_ID = '64a000000000000000000002';
const ANNUNCIO_ID = '64a000000000000000000003';

const tokenAdmin = jwt.sign(
  { sub: ADMIN_ID, ruolo: 'amministratore' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Fixtures
const appartamentoFake = {
  _id: APPARTAMENTO_ID,
  amministratoreId: ADMIN_ID,
  numStanze: 3,
  numBagni: 1,
  mqTot: 80,
  terrazzo: true,
  classeEnergetica: 'B',
  camere: [{ tipo: 'SINGOLA', prezzo: 400 }],
  toObject() { return { ...this }; },
};

const annuncioFake = {
  _id: ANNUNCIO_ID,
  stato: 'Attivo',
  descrizione: 'Bel appartamento',
  dataPubbl: new Date('2024-01-01'),
  appartamento: appartamentoFake,
  appartamentoId: APPARTAMENTO_ID,
  toObject() { return { ...this }; },
  set(data) { Object.assign(this, data); },
  async save() { return this; },
};

describe('Suite di test annunci', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v2/appartamenti/:appartamentoId/annuncio', () => {
    afterEach(() => jest.restoreAllMocks());

    // TEST CASE N.55
    test('restituisce 404 se l\'annuncio non esiste', async () => {
      jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
      jest.spyOn(Annuncio, 'findOne').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      });
      const chainMock = { populate: jest.fn() };
      chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(null);
      jest.spyOn(Annuncio, 'findOne').mockReturnValue(chainMock);

      const res = await request(app)
        .get(`/api/v2/appartamenti/${APPARTAMENTO_ID}/annuncio`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(404);
    });

  });

  describe('POST /api/v2/appartamenti/:appartamentoId/annuncio', () => {
    afterEach(() => jest.restoreAllMocks());

    // TEST CASE N.87
    test('restituisce 401 senza token', async () => {
      const res = await request(app)
        .post(`/api/v2/appartamenti/${APPARTAMENTO_ID}/annuncio`)
        .send({ descrizione: 'Test', attivo: true });
      expect(res.status).toBe(401);
    });

    // TEST CASE N.88
    test('restituisce 403 se l\'utente non è amministratore', async () => {
      const tokenInquilino = jwt.sign(
        { sub: '64a000000000000000000010', ruolo: 'inquilino' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post(`/api/v2/appartamenti/${APPARTAMENTO_ID}/annuncio`)
        .set('Authorization', `Bearer ${tokenInquilino}`)
        .send({ descrizione: 'Test', attivo: true });

      expect(res.status).toBe(403);
    });

    // TEST CASE N.54
    test('aggiorna un annuncio esistente e restituisce 200', async () => {
      jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
      jest.spyOn(Annuncio, 'findOne').mockResolvedValue(annuncioFake);
      const chainMock = { populate: jest.fn() };
      chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(annuncioFake);
      jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

      const res = await request(app)
        .post(`/api/v2/appartamenti/${APPARTAMENTO_ID}/annuncio`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ descrizione: 'Aggiornato', attivo: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v2/annunci/:id', () => {
    afterEach(() => jest.restoreAllMocks());

    // TEST CASE N.89
    test('restituisce 401 senza token', async () => {
      const res = await request(app).delete(`/api/v2/annunci/${ANNUNCIO_ID}`);
      expect(res.status).toBe(401);
    });

    // TEST CASE N.90
    test('restituisce 404 se l\'annuncio non esiste', async () => {
      const chainMock = { populate: jest.fn() };
      chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(null);
      jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

      const res = await request(app)
        .delete(`/api/v2/annunci/${ANNUNCIO_ID}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(404);
    });

    // TEST CASE N.61
    test('elimina l\'annuncio e restituisce 200', async () => {
      const chainMock = { populate: jest.fn() };
      chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(annuncioFake);
      jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);
      jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
      jest.spyOn(Annuncio, 'findByIdAndDelete').mockResolvedValue(annuncioFake);

      const res = await request(app)
        .delete(`/api/v2/annunci/${ANNUNCIO_ID}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/eliminato/i);
    });
  });
});