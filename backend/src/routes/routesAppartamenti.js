/**
 * @openapi
 * tags:
 *   - name: Appartamenti
 *     description: Operazioni CRUD su appartamenti
 */

// src/routes/routesAppartamenti.js — Routes CRUD Appartamento
//
// Definisce gli endpoint REST per la gestione degli appartamenti:
// - POST /appartamenti → crea appartamento
// - GET /appartamenti → lista appartamenti (con paginazione e filtri)
// - GET /appartamenti/:id → dettaglio appartamento
// - PUT /appartamenti/:id → aggiorna appartamento
// - DELETE /appartamenti/:id → elimina appartamento
// - GET /admin/:amministratoreId → appartamenti di un amministratore

const express = require('express');
const router = express.Router();

const {
  creaAppartamento,
  getAppartamentoDaId,
  aggiornaAppartamento,
  eliminaAppartamento,
  getAppartamentiAdmin,
} = require('../controllers/controllerAppartamenti');

// Middleware di autenticazione e validazione
const { autenticaToken } = require('../middleware/auth');
const { verificaBodyCreazione, verificaBodyAggiornamento } = require('../middleware/verificaBody');
const { verificaProprietario } = require('../middleware/verificaPropr');

/**
 * @openapi
 * /appartamenti:
 *   post:
 *     summary: Crea un nuovo appartamento
 *     description: Crea un nuovo appartamento con i dati forniti nel corpo della richiesta. Richiede autenticazione JWT.
 *     tags:
 *       - Appartamenti
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - indirizzo
 *               - mqTot
 *               - numStanze
 *               - numBagni
 *               - amministratoreId
 *             properties:
 *               indirizzo:
 *                 $ref: '#/components/schemas/Indirizzo'
 *               mqTot:
 *                 type: number
 *                 example: 95.5
 *                 description: Metri quadrati totali dell'appartamento
 *               perStudenti:
 *                 type: boolean
 *                 example: false
 *                 description: Se l'appartamento è per studenti
 *               numStanze:
 *                 type: number
 *                 example: 3
 *                 description: Numero di stanze/camere
 *               numBagni:
 *                 type: number
 *                 example: 2
 *                 description: Numero di bagni
 *               foto:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URL delle foto dell'appartamento
 *               terrazzo:
 *                 type: boolean
 *                 example: true
 *                 description: Se l'appartamento ha un terrazzo
 *               lavatrice:
 *                 type: boolean
 *                 example: true
 *                 description: Se l'appartamento ha una lavatrice
 *               classeEnergetica:
 *                 type: string
 *                 enum: ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G']
 *                 example: 'B'
 *                 description: Classe energetica dell'appartamento
 *               amministratoreId:
 *                 type: string
 *                 description: ID del proprietario/amministratore dell'appartamento
 *     responses:
 *       201:
 *         description: Appartamento creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appartamento'
 *       400:
 *         description: Errori di validazione nel body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Non autenticato - token non fornito o non valido
 *       500:
 *         description: Errore interno del server
 */
router.post('/', autenticaToken, verificaBodyCreazione, creaAppartamento);

/*
 * GET /appartamenti
 * Recupera la lista di appartamenti con paginazione e filtri.
 * Query params: page, limit, perStudenti, città
 
router.get('/', (req, res, next) => {
  // Placeholder: per ora supportiamo solo le altre rotte
  res.status(200).json({
    success: true,
    message: 'GET /appartamenti - Lista appartamenti (da implementare con filtri avanzati)',
  });
});
*/

/**
 * @openapi
 * /appartamenti/admin/{amministratoreId}:
 *   get:
 *     summary: Recupera appartamenti di un amministratore
 *     description: Recupera tutti gli appartamenti gestiti da un amministratore specifico con paginazione.
 *     tags:
 *       - Appartamenti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: amministratoreId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'amministratore (proprietario)
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero della pagina
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Numero di risultati per pagina
 *     responses:
 *       200:
 *         description: Lista appartamenti dell'amministratore recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appartamento'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Non autenticato
 *       500:
 *         description: Errore interno del server
 */
router.get('/admin/:amministratoreId', autenticaToken, getAppartamentiAdmin);

/**
 * @openapi
 * /appartamenti/{id}:
 *   get:
 *     summary: Recupera i dettagli di un appartamento
 *     description: Recupera le informazioni complete di un appartamento specifico per ID.
 *     tags:
 *       - Appartamenti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'appartamento (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Appartamento recuperato con successo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appartamento'
 *       401:
 *         description: Non autenticato
 *       404:
 *         description: Appartamento non trovato
 *       500:
 *         description: Errore interno del server
 */
router.get('/:id', autenticaToken, getAppartamentoDaId);

/**
 * @openapi
 * /appartamenti/{id}:
 *   put:
 *     summary: Aggiorna un appartamento
 *     description: Aggiorna i dettagli di un appartamento specifico. Solo il proprietario può modificare il proprio appartamento.
 *     tags:
 *       - Appartamenti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'appartamento (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campi da aggiornare (tutti opzionali)
 *             properties:
 *               indirizzo:
 *                 $ref: '#/components/schemas/Indirizzo'
 *               mqTot:
 *                 type: number
 *               perStudenti:
 *                 type: boolean
 *               numStanze:
 *                 type: number
 *               numBagni:
 *                 type: number
 *               foto:
 *                 type: array
 *                 items:
 *                   type: string
 *               terrazzo:
 *                 type: boolean
 *               lavatrice:
 *                 type: boolean
 *               classeEnergetica:
 *                 type: string
 *                 enum: ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G']
 *     responses:
 *       200:
 *         description: Appartamento aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appartamento'
 *       400:
 *         description: Errori di validazione nel body
 *       401:
 *         description: Non autenticato
 *       403:
 *         description: Non sei autorizzato - non sei il proprietario di questo appartamento
 *       404:
 *         description: Appartamento non trovato
 *       500:
 *         description: Errore interno del server
 */
router.put('/:id', autenticaToken, verificaProprietario, verificaBodyAggiornamento, aggiornaAppartamento);

/**
 * @openapi
 * /appartamenti/{id}:
 *   delete:
 *     summary: Elimina un appartamento
 *     description: Elimina un appartamento specifico. Solo il proprietario può eliminare il proprio appartamento. Nota le avvertenze se ci sono annunci associati.
 *     tags:
 *       - Appartamenti
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'appartamento (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Appartamento eliminato con successo (con eventuali avvertenze se aveva annunci associati)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appartamento'
 *                     warnings:
 *                       type: string
 *                       example: "Erano presenti 2 annunci associati"
 *       401:
 *         description: Non autenticato
 *       403:
 *         description: Non sei autorizzato - non sei il proprietario di questo appartamento
 *       404:
 *         description: Appartamento non trovato
 *       500:
 *         description: Errore interno del server
 */
router.delete('/:id', autenticaToken, verificaProprietario, eliminaAppartamento);

module.exports = router;
