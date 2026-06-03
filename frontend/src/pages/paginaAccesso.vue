<template>
	<main class="relative min-h-screen overflow-hidden bg-zinc-950">
		<div
			class="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
			:style="{ backgroundImage: `url(${castello})` }"
			aria-hidden="true"
		/>
		<div class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-primary/45" aria-hidden="true" />

		<section class="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
			<div class="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">

				<!-- Colonna sinistra -->
				<div class="flex flex-col justify-between gap-6 p-8 text-white sm:p-10 lg:p-10">
					<div class="space-y-4">
						<p class="font-display text-xs uppercase tracking-[0.35em] text-white/75">Trento Apartment Service</p>
						<transition
							enter-active-class="transition duration-300 ease-out"
							enter-from-class="opacity-0 translate-y-2"
							enter-to-class="opacity-100 translate-y-0"
							leave-active-class="transition duration-200 ease-in"
							leave-from-class="opacity-100 translate-y-0"
							leave-to-class="opacity-0 -translate-y-2"
							mode="out-in"
						>
							<div v-if="view === 'login'" key="login-title" class="space-y-3">
								<h1 class="font-display text-3xl leading-tight sm:text-4xl">
									Accedi al tuo account TAS
								</h1>
								<hr class="border-white/20" />
								<p class="text-sm leading-6 text-white/80">
									Bentornato. Inserisci le tue credenziali per accedere ai servizi della piattaforma.
								</p>
							</div>
							<div v-else key="register-title" class="space-y-3">
								<h1 class="font-display text-3xl leading-tight sm:text-4xl">
									Crea il tuo account TAS
								</h1>
								<hr class="border-white/20" />
								<p class="text-sm leading-6 text-white/80">
									Benvenuto in TAS! Crea il tuo account in pochi passaggi e inizia subito a gestire le tue locazioni a Trento.
								</p>
							</div>
						</transition>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<img :src="logoComune" alt="Comune di Trento" class="h-14 w-auto object-contain" />
						<img :src="logoUni" alt="Università di Trento" class="h-14 w-auto object-contain" />
					</div>
				</div>

				<!-- Colonna destra: form con transizione -->
				<div class="bg-white/95 p-6 sm:p-8 lg:p-10">
					<transition
						enter-active-class="transition duration-300 ease-out"
						enter-from-class="opacity-0 translate-x-4"
						enter-to-class="opacity-100 translate-x-0"
						leave-active-class="transition duration-200 ease-in"
						leave-from-class="opacity-100 translate-x-0"
						leave-to-class="opacity-0 -translate-x-4"
						mode="out-in"
					>
						<FormLogin
							v-if="view === 'login'"
							key="login"
							@switch-to-register="view = 'register'"
							@forgot-password="openRecoveryModal"
						/>
						<FormRegistrazione
							v-else
							key="register"
							@switch-to-login="view = 'login'"
						/>
					</transition>
				</div>
			</div>
		</section>

		<transition
			enter-active-class="transition duration-200 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition duration-150 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showRecoveryModal"
				class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
				@click.self="closeRecoveryModal"
			>
				<div class="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" aria-hidden="true"></div>
				<div class="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/15 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
					<div class="space-y-3">
							<p class="font-display text-xs uppercase tracking-[0.25em] text-primary">Recupero password</p>
							<h2 class="font-display text-2xl text-zinc-900">Inserisci la tua email</h2>
							<p class="text-sm leading-6 text-zinc-600">
								Ti invieremo un link per reimpostare la password. Se non ricevi l'email entro pochi minuti, controlla la cartella dello spam o riprova.
							</p>
							<!-- Messaggio di feedback per invio/reset -->
							<div v-if="recoveryMessage" :class="recoveryClass">{{ recoveryMessage }}</div>
						</div>

					<form class="mt-6 space-y-4" @submit.prevent="handleRecoverySubmit">
						<label class="block space-y-2">
							<span class="text-sm font-semibold text-zinc-700">Email</span>
							<input
								v-model="recoveryEmail"
								type="email"
								autocomplete="email"
								class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
								placeholder="nome@example.com"
								required
							/>
								</label>

							<div class="flex flex-col gap-3 sm:flex-row">
							<button
								type="button"
								class="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
								@click="closeRecoveryModal"
							>
								Annulla
							</button>
							<button
								type="submit"
								:disabled="isRecoveryLoading"
								class="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60"
							>
								<span v-if="isRecoveryLoading">Caricamento...</span>
								<span v-else>Conferma email</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</transition>
	</main>
</template>

<script setup>
import { ref, computed } from 'vue'
import FormLogin from '../components/formLogin.vue'
import FormRegistrazione from '../components/formRegistrazione.vue'
import castello from '../assets/images/TrentoCastello.jpg'
import logoComune from '../assets/images/logoComuneW.png'
import logoUni from '../assets/images/logoUnitnW.png'
import { requestPasswordReset } from '../services/authService'

// Se l'URL contiene ?view=register, la pagina parte già sulla scheda di registrazione.
import { useRoute } from 'vue-router'
const route = useRoute()
const view = ref(route.query.view === 'register' ? 'register' : 'login')

const showRecoveryModal = ref(false)
const recoveryEmail = ref('')
const recoveryMessage = ref('')
const isRecoveryLoading = ref(false)
let recoveryTimeout = null

const recoveryClass = computed(() => {
	if (!recoveryMessage.value) return ''
	const txt = recoveryMessage.value.toLowerCase()
	const isError = txt.includes('errore') || txt.includes('errore durante')
	return isError ? 'mt-4 rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-100' : 'mt-4 rounded-lg p-3 text-sm bg-green-50 text-green-700 border border-green-100'
})

function openRecoveryModal(email = '') {
	recoveryEmail.value = email?.trim() || recoveryEmail.value
	recoveryMessage.value = ''
	showRecoveryModal.value = true
}

function closeRecoveryModal() {
	showRecoveryModal.value = false
	// Cancella eventuale timeout programmato per il ritorno automatico
	if (recoveryTimeout) {
		clearTimeout(recoveryTimeout)
		recoveryTimeout = null
	}
	recoveryMessage.value = ''
}

async function handleRecoverySubmit() {
	if (!recoveryEmail.value.trim()) {
		recoveryMessage.value = 'Inserisci un indirizzo email valido.'
		return
	}

	isRecoveryLoading.value = true
	// Mostra subito messaggio per l'utente mentre la richiesta è in corso
	recoveryMessage.value = 'Controlla la tua casella di posta'
	try {
		await requestPasswordReset(recoveryEmail.value.trim())
		// Manteniamo il messaggio visibile anche dopo il successo per chiarezza
		// Dopo 5 secondi chiudiamo il modal e torniamo alla vista di login
		if (recoveryTimeout) clearTimeout(recoveryTimeout)
		recoveryTimeout = setTimeout(() => {
			recoveryTimeout = null
			closeRecoveryModal()
			view.value = 'login'
		}, 5000)
	} catch (err) {
		console.error('Errore richiesta reset password:', err)
		recoveryMessage.value = 'Errore durante l\'invio. Riprova più tardi.'
	} finally {
		isRecoveryLoading.value = false
	}
}
</script>