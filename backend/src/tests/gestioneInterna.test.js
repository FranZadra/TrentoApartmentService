// Test delle API per la gestione interna (routesGestioneInterna)
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Contratto = require('../models/Contratto');
const Guasto = require('../models/Guasto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const INQUILINO_ID = '64e000000000000000000001';
const APP_ID = '64e000000000000000000002';

const contrattoFake = {
 _id: '64e000000000000000000005',
 idInquilini: [INQUILINO_ID],
 listaSpesa: []
};

const tokenInquilino = jwt.sign(
{ sub: INQUILINO_ID, ruolo: 'inquilino' },
JWT_SECRET
);

describe('Suite di Test: Gestione Interna Coinquilini (US21, US23, US24)', () => {
   beforeEach(() => {
   jest.clearAllMocks();
   });

   // --- SEGNALAZIONE GUASTI (US24) ---
   describe('POST /api/v1/gestione-interna/guasti', () => {
  
        // TEST CASE N.66
        test('Inserimento segnalazione guasto bloccato se manca la priorità', async () => {

            jest.spyOn(Contratto, 'findOne').mockResolvedValue({ _id: '64e000000000000000000005' });
            jest.spyOn(User, 'findById').mockResolvedValue({ _id: INQUILINO_ID, nome: 'Mario', cognome: 'Rossi', ruolo: 'inquilino' });

            const res = await request(app)
            .post('/api/v1/gestione-interna/guasti')
            .set('Authorization', `Bearer ${tokenInquilino}`)
            .send({
                idAppartamento: APP_ID,
                descrizione: 'La caldaia non funziona',
                categoria: 'Riscaldamento'
                //priorità mancante
            });

            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('La priorità deve essere valida');
       });

        // TEST CASE N.64
        test('Inserimento segnalazione fallisce se la descrizione è vuota', async () => {
    
            jest.spyOn(Contratto, 'findOne').mockResolvedValue({ _id: '64e000000000000000000005' });
            jest.spyOn(User, 'findById').mockResolvedValue({ _id: INQUILINO_ID, nome: 'Mario', cognome: 'Rossi', ruolo: 'inquilino' });

           const res = await request(app)
            .post('/api/v1/gestione-interna/guasti')
            .set('Authorization', `Bearer ${tokenInquilino}`)
            .send({
                idAppartamento: APP_ID,
                descrizione: '',
                categoria: 'Idraulica',
                priorita: 'alta'
           });

           expect(res.status).toBe(400);
           expect(res.body.errors).toContain('La descrizione del guasto è obbligatoria');
       });
   });

   // --- LISTA DELLA SPESA (US21) ---
   describe('PUT /api/v1/gestione-interna/spesa/:contrattoId', () => {

   // TEST CASE N.80
       test('Aggiornamento lista della spesa fallisce se un articolo ha quantità <= 0', async () => {
           jest.spyOn(Contratto, 'findById').mockResolvedValue(contrattoFake);

           const res = await request(app)
           .put('/api/v1/gestione-interna/spesa/64e000000000000000000005')
           .set('Authorization', `Bearer ${tokenInquilino}`)
           .send({
               listaSpesa: [{ nome: 'Pane', quantita: 0 }]
           });

           expect(res.status).toBe(400);
           expect(res.body.error).toBe('Ogni elemento deve avere una quantità valida');
       });
   });

   //GESTIONE FACCENDE e CALENDARIO
   describe('POST /api/v1/gestione-interna/faccende/:appId', () => {

       // TEST CASE N.83
       test('Inserimento con successo di una nuova faccenda condivisa', async () => {
           const contrattoFake = {
           _id: '64e000000000000000000005',
           faccende: {
               id: jest.fn()
           }
           };

           jest.spyOn(Contratto, 'findOne').mockResolvedValue(contrattoFake);
           jest.spyOn(Contratto, 'updateOne').mockResolvedValue({ modifiedCount: 1 });

           jest.spyOn(User, 'findById').mockResolvedValue({ _id: INQUILINO_ID, nome: 'Mario', cognome: 'Rossi', ruolo: 'inquilino' });

           const res = await request(app)
           .post('/api/v1/gestione-interna/faccende/64e000000000000000000005')
           .set('Authorization', `Bearer ${tokenInquilino}`)
           .send({
               titolo: 'Pulizia corridoio',
               visibilita: 'condivisa',
               descrizione: 'Turno settimanale'
           });

           expect(res.status).toBe(201);
           expect(res.body.data.titolo).toBe('Pulizia corridoio');
           expect(Contratto.updateOne).toHaveBeenCalledWith(
           { _id: contrattoFake._id },
           expect.any(Object)
           );
       });

       // TEST CASE N.86
       test('Tentativo eliminazione faccenda altrui restituisce 403', async () => {
           const faccendaDiUnAltro = {
               _id: new mongoose.Types.ObjectId(),
               idCreatore: '64e000000000000000000999', // ID diverso da INQUILINO_ID
               titolo: 'Lavare i piatti'
           };

           const contrattoFake = {
               _id: '64e000000000000000000005',
               faccende: {
                   id: jest.fn().mockReturnValue(faccendaDiUnAltro)
               }
           };

           jest.spyOn(Contratto, 'findOne').mockResolvedValue(contrattoFake);

           const res = await request(app)
           .delete(`/api/v1/gestione-interna/faccende/64e000000000000000000005/${faccendaDiUnAltro._id}`)
           .set('Authorization', `Bearer ${tokenInquilino}`);

           expect(res.status).toBe(403);
           expect(res.body.error).toBe('Non puoi eliminare questa faccenda');
       });
   });
});
