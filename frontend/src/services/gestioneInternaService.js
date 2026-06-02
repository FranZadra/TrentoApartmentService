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

export async function getCalendarioRifiutiAppartamento(appId) {
  try {
    const response = await api.get(`/gestione-interna/rifiuti/${appId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore nel recupero del calendario rifiuti'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function aggiornaCalendarioRifiutiAppartamento(appId, calendarioRifiuti) {
  try {
    const response = await api.put(`/gestione-interna/rifiuti/${appId}`, { calendarioRifiuti })
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'aggiornamento del calendario rifiuti'
    return { success: false, error: message, status: error.response?.status }
  }
}

// ---- US23: Faccende del calendario condiviso ----

export async function getFaccendeAppartamento(appId) {
  try {
    const response = await api.get(`/gestione-interna/faccende/${appId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore nel recupero delle faccende'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function aggiungiFaccendaAppartamento(appId, payload) {
  try {
    const response = await api.post(`/gestione-interna/faccende/${appId}`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'aggiunta della faccenda'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function aggiornaFaccendaAppartamento(appId, faccendaId, payload) {
  try {
    const response = await api.put(`/gestione-interna/faccende/${appId}/${faccendaId}`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'aggiornamento della faccenda'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function eliminaFaccendaAppartamento(appId, faccendaId) {
  try {
    const response = await api.delete(`/gestione-interna/faccende/${appId}/${faccendaId}`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'eliminazione della faccenda'
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

export async function prendiInCaricoGuastoAdmin(guastoId) {
  try {
    const response = await api.put(`/gestione-interna/admin/guasti/${guastoId}/carico`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'operazione'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function risolviGuasto(guastoId) {
  try {
    const response = await api.put(`/gestione-interna/guasti/${guastoId}/risolvi`)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.error || 'Errore durante l\'operazione'
    return { success: false, error: message, status: error.response?.status }
  }
}

export async function aggiornaListaSpesa(contrattoId, listaSpesa) {
    try {
        const response = await api.put(`/gestione-interna/spesa/${contrattoId}`, { listaSpesa })
        return { success: true, data: response.data }
    } catch (error) {
        const message = error.response?.data?.error || 'Errore durante l\'aggiornamento della lista spesa'
        return { success: false, error: message, status: error.response?.status }
    }
}

export default api