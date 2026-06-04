// tests/statistiche.test.js
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


 // TEST CASE N.73
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


 // TEST CASE N.71
test('Generazione report statistico aggregato con successo', async () => {
  // 1. Il controller esegue 3 aggregazioni in parallelo. 
  // Usiamo mockResolvedValueOnce per dare una risposta specifica a ciascuna di esse in ordine di chiamata.
  jest.spyOn(Appartamento, 'aggregate')
    .mockResolvedValueOnce([ // Risposta per: pipelinePerCAP
      { cap: '38122', numAppartamenti: 45, prezzoSommaMq: 562.5, prezzoCountMq: 45, prezzoMedioMq: 12.5 }
    ])
    .mockResolvedValueOnce([ // Risposta per: pipelinePerTipo
      { tipo: 'SINGOLA', count: 10, prezzoMedio: 350 }
    ])
    .mockResolvedValueOnce([ // Risposta per: pipelineTotaleAppartamenti
      { totale: 120 }
    ]);

  // 2. Mock dei metodi di Contratto usati nel controller
  jest.spyOn(Contratto, 'aggregate').mockResolvedValue([
    { _id: 'attivo', count: 80 },
    { _id: 'terminato', count: 30 }
  ]);
  jest.spyOn(Contratto, 'countDocuments').mockResolvedValue(5);

  // 3. FONDAMENTALE: Mock della funzione distinct di Appartamento usata a fine controller
  jest.spyOn(Appartamento, 'distinct').mockResolvedValue(['38122', '38123']);

  const res = await request(app)
    .get('/api/v1/statistiche')
    .set('Authorization', `Bearer ${tokenDipendente}`);

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  
  // Verifiche sui dati elaborati dal controller
  expect(res.body.data.totaleAppartamenti).toBe(120);
  expect(res.body.data.contratti.attivi).toBe(80);
  expect(res.body.data.distribuzionePerCAP[0].cap).toBe('38122');
  
  // Sicurezza privacy (RNF10)
  expect(res.body.data.idInquilini).toBeUndefined();
  expect(res.body.data.nomi).toBeUndefined();
});


// TEST CASE N.72
test('Richiesta statistiche filtrando per un CAP specifico', async () => {
  // 1. Poiché viene passato il parametro 'cap', il controller esegue anzitutto Appartamento.find()
  jest.spyOn(Appartamento, 'find').mockResolvedValue([
    { _id: '64b000000000000000000002' }
  ]);

  // 2. Mock in sequenza delle 3 aggregazioni avviate dal Promise.all
  const aggregateSpy = jest.spyOn(Appartamento, 'aggregate')
    .mockResolvedValueOnce([ // pipelinePerCAP
      { cap: '38123', numAppartamenti: 12, prezzoSommaMq: 169.2, prezzoCountMq: 12, prezzoMedioMq: 14.10 }
    ])
    .mockResolvedValueOnce([]) // pipelinePerTipo (vuota nel mock)
    .mockResolvedValueOnce([{ totale: 12 }]); // pipelineTotaleAppartamenti

  // 3. Mock delle restanti chiamate al DB
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
