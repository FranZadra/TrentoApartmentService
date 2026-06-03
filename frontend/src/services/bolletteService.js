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

// Apre il PDF di una bolletta in una nuova scheda.
// Non basta un semplice <a href>: l'endpoint del PDF è protetto da JWT e un link
// diretto non porta con sé l'header Authorization. Il backend risponde quindi 401
// e il browser mostra il messaggio di errore al posto del documento.
// Soluzione: scarichiamo il file con axios (l'interceptor allega il token), lo
// trasformiamo in un object URL locale e lo apriamo.
export async function apriPdfBolletta(bollettaId) {
  try {
    const res = await api.get(`/bollette/${bollettaId}/pdf`, { responseType: 'blob' })

    const blobUrl = URL.createObjectURL(res.data)

    // Aprire con un click su <a> è più affidabile di window.open() dopo un await
    // (i blocca-popup tendono a bloccare quest'ultimo perché non più legato al click)
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
