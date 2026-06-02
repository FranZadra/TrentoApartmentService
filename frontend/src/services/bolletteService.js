import axios from 'axios'

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

// ── Funzioni amministratore ───────────────────────────────────────────────────

export async function getBolletteAdmin(appartamentoId) {
  try {
    const res = await api.get(`/bollette/admin/${appartamentoId}`)
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore nel recupero delle bollette' }
  }
}

export async function caricaBolletta(appartamentoId, formData) {
  try {
    // Axios con FormData imposta automaticamente il Content-Type multipart/form-data
    // con il boundary corretto — non va impostato manualmente
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
    const res = await api.patch(`/bollette/${bollettaId}/paga`)
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

// ── Funzioni inquilino ────────────────────────────────────────────────────────

export async function getBolletteInquilino() {
  try {
    const res = await api.get('/bollette/inquilino')
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || 'Errore nel recupero delle bollette' }
  }
}

// Restituisce l'URL per aprire/scaricare il PDF in una nuova scheda del browser
export function getPdfUrl(bollettaId) {
  return `/api/v1/bollette/${bollettaId}/pdf`
}
