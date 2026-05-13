import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Intercettore: aggiunge token JWT se presente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const annunciService = {
  getAll(params = {}) {
    return api.get('/annunci', { params })
  },
  getById(id) {
    return api.get(`/annunci/${id}`)
  },
  create(data) {
    return api.post('/annunci', data)
  },
  update(id, data) {
    return api.put(`/annunci/${id}`, data)
  },
  delete(id) {
    return api.delete(`/annunci/${id}`)
  },
}