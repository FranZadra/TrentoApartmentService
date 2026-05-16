<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<div class="space-y-2">
			<p class="font-display text-sm uppercase tracking-[0.25em] text-primary">Registrazione</p>
			<h2 class="font-display text-3xl text-zinc-900">Crea il tuo profilo</h2>
			<p class="text-sm leading-6 text-zinc-600">
				Inserisci i dati richiesti per creare il tuo account.
			</p>
		</div>

		<!-- Messaggio di errore -->
		<div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			{{ errorMessage }}
		</div>

		<!-- Messaggio di successo -->
		<div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
			{{ successMessage }}
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Nome</span>
				<input
					v-model="form.nome"
					type="text"
					autocomplete="given-name"
					:disabled="isLoading"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
					placeholder="Mario"
					required
				/>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Cognome</span>
				<input
					v-model="form.cognome"
					type="text"
					autocomplete="family-name"
					:disabled="isLoading"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
					placeholder="Rossi"
					required
				/>
			</label>
		</div>

		<label class="block space-y-2">
			<span class="text-sm font-semibold text-zinc-700">Email</span>
			<input
				v-model="form.email"
				type="email"
				autocomplete="email"
				:disabled="isLoading"
				class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
				placeholder="nome@example.com"
				required
			/>
		</label>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Password</span>
				<input
					v-model="form.password"
					type="password"
					autocomplete="new-password"
					:disabled="isLoading"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
					placeholder="••••••••"
					required
				/>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Conferma password</span>
				<input
					v-model="form.confirmPassword"
					type="password"
					autocomplete="new-password"
					:disabled="isLoading"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
					placeholder="••••••••"
					required
				/>
			</label>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row">
			<button
				type="submit"
				:disabled="isLoading"
				class="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:bg-zinc-400 disabled:shadow-none"
			>
				{{ isLoading ? 'Registrazione in corso...' : 'Registrati' }}
			</button>

			<RouterLink
				:to="isLoading ? '' : '/'"
				:class="isLoading && 'pointer-events-none opacity-50'"
				class="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
			>
				Torna alla home
			</RouterLink>
		</div>
	</form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registerUser } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
	nome: '',
	cognome: '',
	email: '',
	password: '',
	confirmPassword: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
	// Reset messaggi
	errorMessage.value = ''
	successMessage.value = ''

	// Validazione: password non vuote
	if (!form.password || !form.confirmPassword) {
		errorMessage.value = 'Le password non possono essere vuote'
		return
	}

	// Validazione: le password devono corrispondere
	if (form.password !== form.confirmPassword) {
		errorMessage.value = 'Le password non corrisppondono'
		return
	}

	// Validazione: password minima
	if (form.password.length < 6) {
		errorMessage.value = 'La password deve contenere almeno 6 caratteri'
		return
	}

	// Validazione: nome e email
	if (!form.nome.trim() || !form.cognome.trim() || !form.email.trim()) {
		errorMessage.value = 'Nome, cognome ed email sono obbligatori'
		return
	}

	isLoading.value = true

	try {
		// Invia la richiesta al backend (concatena nome + cognome se necessario)
		const userData = {
			nome: form.nome.trim() + ' ' + form.cognome.trim(),
			email: form.email.trim(),
			password: form.password,
		}

		const response = await registerUser(userData)

		if (response.success) {
			successMessage.value = '✅ Registrazione completata! Reindirizzamento...'

			// Opzionale: se il backend restituisce un token, salvalo nello store
			// authStore.login(response.data.utente, response.data.token)

			// Reindirizza alla home dopo 2 secondi
			setTimeout(() => {
				router.push('/')
			}, 2000)
		} else {
			errorMessage.value = response.error || 'Errore durante la registrazione'
		}
	} catch (error) {
		errorMessage.value = 'Errore di rete. Riprova più tardi.'
		console.error('Errore registrazione:', error)
	} finally {
		isLoading.value = false
	}
}
</script>
