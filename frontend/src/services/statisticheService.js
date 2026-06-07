import axios from 'axios'

// baseURL '/api/v2' con versioning
const api = axios.create({
  baseURL: '/api/v2',
  headers: { 'Content-Type': 'application/json' },
})

// Token JWT in ogni richiesta
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }
  return config
})

// Statistiche aggregate degli affitti e degli appartamenti
export async function getStatistiche(params = {}) {
  try {
    const response = await api.get('/statistiche', { params })
    return { success: true, data: response.data }
  } catch (error) {
    const message =
      error.response?.data?.message || 'Errore nel recupero delle statistiche'
    return { success: false, error: message, status: error.response?.status }
  }
}

export default api
