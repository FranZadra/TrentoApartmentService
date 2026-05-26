import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Store Pinia per la gestione dell'autenticazione utente
export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem('tas_user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(localStorage.getItem('tas_token') || null)

  // true se l'utente ha un token valido in localStorage
  const isAuthenticated = computed(() => !!token.value)

  // Iniziali nome+cognome per avatar (es. "MG")
  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.nome?.[0] ?? ''}${user.value.cognome?.[0] ?? ''}`.toUpperCase()
  })

  function login(userData, authToken) {
    user.value = userData || null
    token.value = authToken || null
    if (authToken) localStorage.setItem('tas_token', authToken)
    if (userData) {
      try {
        localStorage.setItem('tas_user', JSON.stringify(userData))
        localStorage.setItem('tas_role', userData.ruolo)
      } catch (e) {
        console.warn('Could not persist user to localStorage', e)
      }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('tas_token')
    localStorage.removeItem('tas_role')
    localStorage.removeItem('tas_user')
  }

  function updateUserRole(newRole) {
    if (user.value) {
      user.value.ruolo = newRole
      localStorage.setItem('tas_user', JSON.stringify(user.value))
      localStorage.setItem('tas_role', newRole)
    }
  }

  return { user, token, isAuthenticated, initials, login, logout, updateUserRole }
})

