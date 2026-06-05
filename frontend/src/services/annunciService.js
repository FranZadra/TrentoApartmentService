import axios from 'axios'

// baseURL '/api/v1' con versioning
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Intercettore: aggiunge il token JWT all'header se l'utente è autenticato
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const annunciService = {
  // GET /api/v1/annunci — lista annunci attivi
  getAll(params = {}) {
    return api.get('/annunci', { params })
  },

  // GET /api/v1/annunci/:id — dettaglio di un singolo annuncio
  getById(id) {
    return api.get(`/annunci/${id}`)
  },

  // GET /api/v1/annunci/search/filter — ricerca degli annunci con filtri
  // params può contenere: numStanze, numBagni, terrazzo, classeEnergetica, mqMin, mqMax, tipoCam, prezzoMin, prezzoMax
  searchWithFilters(params = {}) {
    return api.get('/annunci/search/filter', { params })
  },

  // GET /api/v1/annunci/admin/appartamento/:appartamentoId — annuncio dell'appartamento dell'admin
  getByApartmentId(appartamentoId) {
    return api.get(`/annunci/admin/appartamento/${appartamentoId}`)
  },

  // POST /api/v1/annunci/admin/appartamento/:appartamentoId — crea o aggiorna l'annuncio dell'appartamento
  upsertByApartmentId(appartamentoId, payload) {
    return api.post(`/annunci/admin/appartamento/${appartamentoId}`, payload)
  },

  // PUT /api/v1/annunci/:id — aggiornamento per annuncio con id specifico
  updateById(id, payload) {
    return api.put(`/annunci/${id}`, payload)
  },
  // DELETE /api/v1/annunci/:id — elimina un annuncio
  deleteById(id) {
    return api.delete(`/annunci/${id}`)
  },

  // GET /api/v1/appartamenti/:id/contatto-admin — contatto dell'admin
  getContattoAdmin(appartamentoId) {
    return api.get(`/appartamenti/${appartamentoId}/contatto-admin`)
  },
}
