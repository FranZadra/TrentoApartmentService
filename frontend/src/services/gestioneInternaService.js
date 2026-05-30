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

export async function segnalaGuasto(payload) {
  try {
    const response = await api.post('/gestione-interna/guasti', payload)
    return { success: true, data: response.data }
  } catch (error) {
    const responseErrors = error.response?.data?.errors
    const message = error.response?.data?.error || error.response?.data?.messaggio || 'Errore durante la segnalazione del guasto'
    return {
      success: false,
      error: message,
      errors: Array.isArray(responseErrors) ? responseErrors : null,
      status: error.response?.status,
    }
  }
}

export async function getGuastiAppartamento(appId) {
  try {
    const response = await api.get(`/gestione-interna/guasti/${appId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore nel recupero dei guasti'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function getGuastiAppartamentoAdmin(appId) {
  try {
    const response = await api.get(`/gestione-interna/admin/guasti/${appId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore nel recupero delle segnalazioni'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function prendiInCaricoGuastoAdmin(guastoId) {
  try {
    const response = await api.put(`/gestione-interna/admin/guasti/${guastoId}/carico`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'operazione'
    return { success: false, error: message, status: error.response?.status }
  }
}

export default api