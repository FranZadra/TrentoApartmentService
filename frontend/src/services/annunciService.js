import axios from 'axios'

// baseURL '/api/v2' con versioning
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v2`,
  headers: { 'Content-Type': 'application/json' },
})

// Aggiunge il token JWT all'header se l'utente è autenticato
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const annunciService = {
  // GET lista annunci
  getAll(params = {}) {
    return api.get('/annunci', { params })
  },

  // GET dettaglio singolo annuncio
  getById(id) {
    return api.get(`/annunci/${id}`)
  },

  // GET ricerca annunci con filtri
  searchWithFilters(params = {}) {
    return api.get('/annunci/search/filter', { params })
  },

  // GET annuncio per appartamento
  getByApartmentId(appartamentoId) {
    return api.get(`/appartamenti/${appartamentoId}/annuncio`)
  },

  // POST annuncio per appartamento
  upsertByApartmentId(appartamentoId, payload) {
    return api.post(`/appartamenti/${appartamentoId}/annuncio`, payload)
  },

  // PUT per annuncio con id specifico
  updateById(id, payload) {
    return api.put(`/annunci/${id}`, payload)
  },
  // DELETE annuncio
  deleteById(id) {
    return api.delete(`/annunci/${id}`)
  },

  // GET contatto dell'admin
  getContattoAdmin(appartamentoId) {
    return api.get(`/appartamenti/${appartamentoId}/contatto-admin`)
  },
}
