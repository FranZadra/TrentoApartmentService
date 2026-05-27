<template>
  <main class="relative min-h-screen overflow-hidden bg-zinc-950">
    <div
      class="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(${castello})` }"
      aria-hidden="true"
    />
    <div class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-primary/45" aria-hidden="true" />

    <section class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <h1 class="text-2xl font-display text-zinc-900 mb-2">Reimposta la password</h1>
      <p class="text-sm text-zinc-600 mb-4">Inserisci la nuova password per il tuo account.</p>

      <div v-if="infoMessage" class="mb-4 rounded-lg p-3 text-sm" :class="infoClass">{{ infoMessage }}</div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <label class="block">
          <span class="text-sm font-semibold text-zinc-700">Nuova password</span>
          <input v-model="password" type="password" minlength="6" required class="mt-2 w-full rounded-2xl border px-4 py-3" placeholder="Almeno 6 caratteri" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold text-zinc-700">Conferma password</span>
          <input v-model="confirmPassword" type="password" minlength="6" required class="mt-2 w-full rounded-2xl border px-4 py-3" placeholder="Ripeti la password" />
        </label>

        <div class="flex gap-3">
          <button type="submit" :disabled="isLoading" class="flex-1 rounded-full bg-primary px-6 py-3 text-white font-semibold disabled:opacity-60">{{ isLoading ? 'Caricamento...' : 'Imposta nuova password' }}</button>
          <button type="button" @click="goToLogin" class="flex-1 rounded-full border px-6 py-3">Annulla</button>
        </div>
      </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../services/authService'
import castello from '../assets/images/TrentoCastello.jpg'

const route = useRoute()
const router = useRouter()
const token = ref(route.query.token || '')

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const infoMessage = ref('')

const infoClass = computed(() => {
  if (!infoMessage.value) return ''
  const txt = infoMessage.value.toLowerCase()
  const errorTriggers = ['errore', 'token mancante', 'non corrispondono', 'la password deve', 'errore durante', 'mancante']
  const isError = errorTriggers.some(trigger => txt.includes(trigger))
  return isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
})

function goToLogin() {
  router.push({ name: 'accesso' })
}

async function handleSubmit() {
  infoMessage.value = ''
  if (!token.value) {
    infoMessage.value = 'Token mancante. Assicurati di aver aperto il link dalla mail.'
    return
  }
  if (!password.value || password.value.length < 6) {
    infoMessage.value = 'La password deve contenere almeno 6 caratteri.'
    return
  }
  if (password.value !== confirmPassword.value) {
    infoMessage.value = 'Le password non corrispondono.'
    return
  }

  isLoading.value = true
  try {
    const res = await resetPassword(token.value, password.value)
    if (res.success) {
      infoMessage.value = 'Password aggiornata con successo. Verrai reindirizzato alla pagina di accesso.'
      setTimeout(() => router.push({ name: 'accesso' }), 1500)
    } else {
      infoMessage.value = res.error || 'Errore durante il reset della password.'
    }
  } catch (err) {
    console.error('reset password error', err)
    infoMessage.value = 'Errore durante il reset della password.'
  } finally {
    isLoading.value = false
  }
}
</script>
