// Test delle API per le statistiche comunali (routesStatistiche)
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const Appartamento = require('../models/Appartamento');
const Contratto = require('../models/Contratto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DIPENDENTE_ID = '64f000000000000000000001';

const tokenDipendente = jwt.sign(
{ sub: DIPENDENTE_ID, ruolo: 'dipendente comune' },
JWT_SECRET
);

describe('Suite di Test: Dashboard Statistiche Comunali (US16)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST CASE N.72
  test('Negazione accesso alle statistiche per ruoli non autorizzati', async () => {
    const tokenInquilinoErrato = jwt.sign(
      { sub: '64f000000000000000000099', ruolo: 'inquilino' },
      JWT_SECRET
    );

    const res = await request(app)
      .get('/api/v1/statistiche')
      .set('Authorization', `Bearer ${tokenInquilinoErrato}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Accesso riservato ai dipendenti comunali');
  });

  // TEST CASE N.70
  test('Generazione report statistico aggregato con successo', async () => {

    jest.spyOn(Appartamento, 'aggregate')
      .mockResolvedValueOnce([ // simula pipelinePerCAP
        { cap: '38122', numAppartamenti: 45, prezzoSommaMq: 562.5, prezzoCountMq: 45, prezzoMedioMq: 12.5 }
      ])
      .mockResolvedValueOnce([ // simula pipelinePerTipo
        { tipo: 'SINGOLA', count: 10, prezzoMedio: 350 }
      ])
      .mockResolvedValueOnce([ // simula pipelineTotaleAppartamenti
        { totale: 120 }
      ]);

    jest.spyOn(Contratto, 'aggregate').mockResolvedValue([
      { _id: 'attivo', count: 80 },
      { _id: 'terminato', count: 30 }
    ]);
    jest.spyOn(Contratto, 'countDocuments').mockResolvedValue(5);

    jest.spyOn(Appartamento, 'distinct').mockResolvedValue(['38122', '38123']);

    const res = await request(app)
      .get('/api/v1/statistiche')
      .set('Authorization', `Bearer ${tokenDipendente}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    expect(res.body.data.totaleAppartamenti).toBe(120);
    expect(res.body.data.contratti.attivi).toBe(80);
    expect(res.body.data.distribuzionePerCAP[0].cap).toBe('38122');
    
    // Anonimizzazione per privacy (RNF10)
    expect(res.body.data.idInquilini).toBeUndefined();
    expect(res.body.data.nomi).toBeUndefined();
  });

  // TEST CASE N.71
  test('Richiesta statistiche filtrando per un CAP specifico', async () => {

    jest.spyOn(Appartamento, 'find').mockResolvedValue([
      { _id: '64b000000000000000000002' }
    ]);

    const aggregateSpy = jest.spyOn(Appartamento, 'aggregate')
      .mockResolvedValueOnce([
        { cap: '38123', numAppartamenti: 12, prezzoSommaMq: 169.2, prezzoCountMq: 12, prezzoMedioMq: 14.10 }
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ totale: 12 }]);

    jest.spyOn(Contratto, 'aggregate').mockResolvedValue([]);
    jest.spyOn(Contratto, 'countDocuments').mockResolvedValue(1);
    jest.spyOn(Appartamento, 'distinct').mockResolvedValue(['38123']);

    const res = await request(app)
      .get('/api/v1/statistiche?cap=38123')
      .set('Authorization', `Bearer ${tokenDipendente}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(aggregateSpy).toHaveBeenCalled();
    expect(res.body.data.distribuzionePerCAP[0].cap).toBe('38123');
  });
});
