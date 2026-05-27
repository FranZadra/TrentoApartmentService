import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }
  }
  return config
})

export async function getContrattiUtenteLoggato() {
  try {
    const response = await api.get('/gestione-interna/contratti')
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.messaggio || 'Errore nel recupero dei contratti'
    return { success: false, error: message, status: error.response?.status }
  }
}

export default api