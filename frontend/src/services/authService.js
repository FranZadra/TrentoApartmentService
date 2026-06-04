import axios from 'axios'

// Istanza axios con base URL per evitare di ripetere /api ogni volta
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

/**
 * Registra un nuovo utente.
 * @param {Object} userData - { nome, email, password }
 * @returns {Promise} Risposta del server con dati utente creato
 */
export async function registerUser(userData) {
  try {
    // Invia i dati della registrazione e restituisce una risposta uniforme al form.
    const response = await apiClient.post('/users/register', userData)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante la registrazione'
    return { success: false, error: message, status: error.response?.status }
  }
}

/**
 * Effettua il login di un utente.
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export async function loginUser(credentials) {
  try {
    // Controlla le credenziali e ritorna il token insieme ai dati utente.
    const response = await apiClient.post('/users/login', credentials)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante il login'
    return { success: false, error: message, status: error.response?.status }
  }
}

/**
 * Richiede il reset password per l'email fornita.
 * Restituisce un oggetto { success, data? , error? }
 */
export async function requestPasswordReset(email) {
  try {
    const response = await apiClient.post('/users/password/forgot', { email })
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante la richiesta di reset password'
    return { success: false, error: message, status: error.response?.status }
  }
}

/**
 * Completa il reset della password con il token ricevuto via email.
 * @param {string} token
 * @param {string} password
 */
export async function resetPassword(token, password) {
  try {
    const response = await apiClient.post('/users/password/reset', { token, password })
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante il reset della password'
    return { success: false, error: message, status: error.response?.status }
  }
}

/**
 * Verifica l'identità dell'utente loggato.
 * Se utente base, lo cambia a utente verificato.
 * @returns {Promise}
 */
export async function verificaIdentitaUser(token) {
  try {
    // Crea un'istanza axios con il token nel header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    const response = await apiClient.put('/users/verifica-identita', {}, config)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante la verifica identità'
    return { success: false, error: message, status: error.response?.status }
  }
}

export function logoutUser() {
  // Per il logout lato client, basta rimuovere il token e i dati utente dallo store
  // La funzione effettiva di logout lato server dipende dall'implementazione (es. blacklist token)
  // rimuoviamo le stesse chiavi usate dallo store
  // Così la sessione sparisce anche dopo un refresh della pagina.
  localStorage.removeItem('tas_token')
  localStorage.removeItem('tas_user')
  localStorage.removeItem('tas_role')
  return { success: true }
}

export default apiClient
