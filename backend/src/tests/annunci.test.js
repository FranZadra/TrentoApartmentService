// tests/annunci.test.js
// Test delle API per gli annunci (annunciRoutes)
// Usa supertest per le chiamate HTTP e jest.spyOn per mockare i modelli Mongoose.

const request = require('supertest');
const app = require('../app'); // adatta il path alla tua app Express
const jwt = require('jsonwebtoken');

const Annuncio = require('../models/annuncio');
const Appartamento = require('../models/Appartamento');

// ─── Token di test ────────────────────────────────────────────────────────────

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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

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

// Simulazione di populate: restituisce l'oggetto con il metodo populate chainabile
function withPopulate(result) {
  const obj = { ...result };
  obj.populate = () => obj;
  return obj;
}

// ─── GET /api/v1/annunci ──────────────────────────────────────────────────────

describe('GET /api/v1/annunci', () => {
  let findSpy;

  beforeEach(() => {
    findSpy = jest.spyOn(Annuncio, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([annuncioFake]),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  test('restituisce 200 con lista annunci attivi', async () => {
    const res = await request(app).get('/api/v1/annunci');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('restituisce count corretto', async () => {
    const res = await request(app).get('/api/v1/annunci');
    expect(res.body.count).toBe(1);
  });
});

// ─── GET /api/v1/annunci/search/filter ───────────────────────────────────────

describe('GET /api/v1/annunci/search/filter', () => {
  beforeEach(() => {
    jest.spyOn(Appartamento, 'find').mockResolvedValue([appartamentoFake]);
    jest.spyOn(Annuncio, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([annuncioFake]),
    });
  });

  afterEach(() => jest.restoreAllMocks());

  test('restituisce 200 senza filtri', async () => {
    const res = await request(app).get('/api/v1/annunci/search/filter');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('passa i filtri corretti a Appartamento.find', async () => {
    const appartFindSpy = jest.spyOn(Appartamento, 'find').mockResolvedValue([]);
    jest.spyOn(Annuncio, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    await request(app).get('/api/v1/annunci/search/filter?numStanze=3&terrazzo=true&prezzoMin=300&prezzoMax=600');

    const filtro = appartFindSpy.mock.calls[0][0];
    expect(filtro.numStanze).toEqual({ $gte: 3 });
    expect(filtro.terrazzo).toBe(true);
    expect(filtro.camere.$elemMatch.prezzo.$gte).toBe(300);
    expect(filtro.camere.$elemMatch.prezzo.$lte).toBe(600);
  });

  test('restituisce array vuoto se nessun appartamento corrisponde', async () => {
    jest.spyOn(Appartamento, 'find').mockResolvedValue([]);
    jest.spyOn(Annuncio, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get('/api/v1/annunci/search/filter?numStanze=99');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });
});

// ─── GET /api/v1/annunci/:id ──────────────────────────────────────────────────

describe('GET /api/v1/annunci/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 200 con i dati dell\'annuncio', async () => {
    jest.spyOn(Annuncio, 'findById').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      // ultimo populate risolve
      then: undefined,
      [Symbol.toPrimitive]: undefined,
      // sovrascriviamo il comportamento finale
      populate: function() { this._called = (this._called || 0) + 1; return this; },
      then(res) { return Promise.resolve(annuncioFake).then(res); },
    });
    // Approccio più semplice: mock diretto
    jest.spyOn(Annuncio, 'findById').mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(annuncioFake),
    }));

    // Mock corretto con catena
    jest.restoreAllMocks();
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(annuncioFake);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app).get(`/api/v1/annunci/${ANNUNCIO_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('restituisce 404 se l\'annuncio non esiste', async () => {
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(null);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app).get(`/api/v1/annunci/${ANNUNCIO_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/v1/annunci/admin/appartamento/:appartamentoId ──────────────────

describe('GET /api/v1/appartamenti/:appartamentoId/annuncio', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 401 senza token', async () => {
    const res = await request(app).get(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`);
    expect(res.status).toBe(401);
  });

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
      .get(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(404);
  });

});

// POST /api/v1/appartamenti/:appartamentoId/annuncio 

describe('POST /api/v1/appartamenti/:appartamentoId/annuncio', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.87
  test('restituisce 401 senza token', async () => {
    const res = await request(app)
      .post(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`)
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
      .post(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`)
      .set('Authorization', `Bearer ${tokenInquilino}`)
      .send({ descrizione: 'Test', attivo: true });

    expect(res.status).toBe(403);
  });

  test('crea un nuovo annuncio e restituisce 200', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'findOne').mockResolvedValue(null); // nessun annuncio esistente
    jest.spyOn(Annuncio, 'create').mockResolvedValue(annuncioFake);
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(annuncioFake);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app)
      .post(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descrizione: 'Nuovo annuncio', attivo: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/salvato/i);
  });

  // TEST CASE N.54
  test('aggiorna un annuncio esistente e restituisce 200', async () => {
    jest.spyOn(Appartamento, 'findById').mockResolvedValue(appartamentoFake);
    jest.spyOn(Annuncio, 'findOne').mockResolvedValue(annuncioFake);
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(annuncioFake);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app)
      .post(`/api/v1/appartamenti/${APPARTAMENTO_ID}/annuncio`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descrizione: 'Aggiornato', attivo: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// PUT /api/v1/annunci/:id 

describe('PUT /api/v1/annunci/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  test('restituisce 401 senza token', async () => {
    const res = await request(app)
      .put(`/api/v1/annunci/${ANNUNCIO_ID}`)
      .send({ descrizione: 'Aggiornato' });
    expect(res.status).toBe(401);
  });

  test('restituisce 404 se l\'annuncio non esiste', async () => {
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(null);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app)
      .put(`/api/v1/annunci/${ANNUNCIO_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descrizione: 'Aggiornato' });
    expect(res.status).toBe(404);
  });

});

// DELETE /api/v1/annunci/:id 

describe('DELETE /api/v1/annunci/:id', () => {
  afterEach(() => jest.restoreAllMocks());

  // TEST CASE N.89
  test('restituisce 401 senza token', async () => {
    const res = await request(app).delete(`/api/v1/annunci/${ANNUNCIO_ID}`);
    expect(res.status).toBe(401);
  });

  // TEST CASE N.90
  test('restituisce 404 se l\'annuncio non esiste', async () => {
    const chainMock = { populate: jest.fn() };
    chainMock.populate.mockReturnValueOnce(chainMock).mockResolvedValueOnce(null);
    jest.spyOn(Annuncio, 'findById').mockReturnValue(chainMock);

    const res = await request(app)
      .delete(`/api/v1/annunci/${ANNUNCIO_ID}`)
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
      .delete(`/api/v1/annunci/${ANNUNCIO_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/eliminato/i);
  });
});