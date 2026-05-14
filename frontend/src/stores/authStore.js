import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('tas_token') || null)

  const isAuthenticated = computed(() => !!token.value)

  const initials = computed(() => {
    if (!user.value) return ''
    return `${user.value.nome?.[0] ?? ''}${user.value.cognome?.[0] ?? ''}`.toUpperCase()
  })

  function login(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('tas_token', authToken)
    localStorage.setItem('tas_role', userData.ruolo)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('tas_token')
    localStorage.removeItem('tas_role')
  }

  return { user, token, isAuthenticated, initials, login, logout }
})