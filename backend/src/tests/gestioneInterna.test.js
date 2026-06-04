// tests/gestioneInterna.test.js
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
            // Mock del contratto attivo per superare il controllo di residenza
            jest.spyOn(Contratto, 'findOne').mockResolvedValue({ _id: '64e000000000000000000005' });
            
            jest.spyOn(User, 'findById').mockResolvedValue({ _id: INQUILINO_ID, nome: 'Mario', cognome: 'Rossi', ruolo: 'inquilino' });

            const res = await request(app)
            .post('/api/v1/gestione-interna/guasti')
            .set('Authorization', `Bearer ${tokenInquilino}`)
            .send({
                idAppartamento: APP_ID,
                descrizione: 'La caldaia non funziona',
                categoria: 'Riscaldamento'
                //priorita mancante
            });

            expect(res.status).toBe(400);
            expect(res.body.errors).toContain('La priorità deve essere valida');
        });


        // TEST CASE N.64
        test('Inserimento segnalazione fallisce se la descrizione è vuota', async () => {
            // Mock del contratto attivo per superare il controllo di residenza
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

    // TEST CASE N.82
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


    // --- GESTIONE FACCENDE & CALENDARIO (US23) ---
    describe('POST /api/v1/gestione-interna/faccende/:appId', () => {

        // TEST CASE N.85
        test('Inserimento nuova faccenda condivisa con successo via $push', async () => {
            const contrattoFake = {
            _id: '64e000000000000000000005',
            faccende: {
                id: jest.fn()
            }
            };

            // Simula il caricamento iniziale del contratto dell'inquilino loggato
            jest.spyOn(Contratto, 'findOne').mockResolvedValue(contrattoFake);
            // Simula l'operazione atomica updateOne con $push implementata nel controller per non rompere le validazioni legacy
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

        // TEST CASE N.88
        test('Tentativo eliminazione faccenda altrui restituisce 403 Forbidden', async () => {
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
