// Routes per la gestione degli annunci

const express = require('express');
const router = express.Router();
const {
  getAnnunciAttivi,
  getAnnuncioById,
  searchAnnunciWithFilters,
  updateAnnuncioById,
} = require('../controllers/annunciController');
const { autenticaToken } = require('../middleware/auth');

// GET annunci
// Lista di tutti gli annunci attivi
// Accessibile da tutti, anche ad utenti non registrati
router.get('/', getAnnunciAttivi);

// GET annunci con filtri
// Ricerca annunci con filtri su appartamento e camere
// Query parameters utilizzabili: numStanze, numBagni, terrazzo, classeEnergetica, mqMin, mqMax, prezzoMin, prezzoMax, tipoCam
router.get('/search/filter', searchAnnunciWithFilters);

// GET annuncio per id
// Dettaglio di un singolo annuncio
router.get('/:id', getAnnuncioById);

// PUT annuncio per id
// Aggiorna un annuncio esistente
router.put('/:id', autenticaToken, updateAnnuncioById);

// DELETE annuncio per id
// Elimina un annuncio esistente
const { deleteAnnuncioById } = require('../controllers/annunciController');
router.delete('/:id', autenticaToken, deleteAnnuncioById);

module.exports = router;