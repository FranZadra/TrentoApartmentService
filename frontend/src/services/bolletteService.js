import axios from 'axios'

// baseURL '/api/v1' con versioning
const api = axios.create({
  baseURL: '/api/v1',
})

// Inietta il token JWT in ogni richiesta
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tas_token')
  if (token) {
    return { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } }
  }
  return config
})

// Funzioni amministratore
export async function getBolletteAdmin(appartamentoId) {
  try {
    const res = await api.get(`/appartamenti/${appartamentoId}/bollette`)
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore nel recupero delle bollette' }
  }
}

export async function caricaBolletta(appartamentoId, formData) {
  try {
    const res = await api.post(`/bollette/${appartamentoId}`, formData)
    return { success: true, data: res.data }
  } catch (err) {
    const errori = err.response?.data?.errors
    return {
      success: false,
      error: err.response?.data?.error || 'Errore durante il caricamento della bolletta',
      errors: Array.isArray(errori) ? errori : null,
    }
  }
}

export async function segnaBollettaPagata(bollettaId) {
  try {
    const res = await api.put(`/bollette/${bollettaId}/paga`)
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore durante l\'operazione' }
  }
}

export async function eliminaBolletta(bollettaId) {
  try {
    const res = await api.delete(`/bollette/${bollettaId}`)
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore durante l\'eliminazione' }
  }
}

// Funzioni inquilino
export async function getBolletteInquilino(appartamentoId) {
  try {
    const res = await api.get(`/appartamenti/${appartamentoId}/bollette`)
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore nel recupero delle bollette' }
  }
}

// Apre il PDF di una bolletta in una nuova scheda
export async function apriPdfBolletta(bollettaId) {
  try {
    const res = await api.get(`/bollette/${bollettaId}/pdf`, { responseType: 'blob' })

    const blobUrl = URL.createObjectURL(res.data)

    const link = document.createElement('a')
    link.href = blobUrl
    link.target = '_blank'
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()

    // Liberiamo la memoria una volta che la scheda ha avuto il tempo di caricare il blob
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Impossibile aprire il PDF della bolletta' }
  }
}
