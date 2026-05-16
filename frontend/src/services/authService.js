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
    const response = await apiClient.post('/users/login', credentials)
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.messaggio || 'Errore durante il login'
    return { success: false, error: message, status: error.response?.status }
  }
}

export function logoutUser() {
  // Per il logout lato client, basta rimuovere il token e i dati utente dallo store
  // La funzione effettiva di logout lato server dipende dall'implementazione (es. blacklist token)
  // rimuoviamo le stesse chiavi usate dallo store
  localStorage.removeItem('tas_token')
  localStorage.removeItem('tas_user')
  localStorage.removeItem('tas_role')
  return { success: true }
}

export default apiClient
