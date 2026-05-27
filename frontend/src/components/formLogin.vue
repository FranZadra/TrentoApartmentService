<template>
	<div class="flex min-h-[580px] flex-col space-y-5">
		<!-- Header -->
		<div class="space-y-1">
			<p class="font-display text-sm uppercase tracking-[0.25em] text-primary">Accesso</p>
			<h2 class="font-display text-3xl text-zinc-900">Bentornato</h2>
			<p class="text-sm leading-6 text-zinc-600">
				Inserisci le tue credenziali per accedere alla piattaforma.
			</p>
		</div>

		<form class="flex flex-1 flex-col space-y-4" @submit.prevent="handleSubmit">
			<!-- Messaggi -->
			<div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				{{ errorMessage }}
			</div>
			<div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
				{{ successMessage }}
			</div>

			<!-- Email -->
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

			<!-- Password -->
			<label class="block space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-semibold text-zinc-700">Password</span>
					<button
						type="button"
						class="text-xs font-medium text-primary transition hover:text-primary-dark hover:underline"
						@click="$emit('forgot-password', form.email)"
					>
						Password dimenticata?
					</button>
				</div>
				<input
					v-model="form.password"
					type="password"
					autocomplete="current-password"
					:disabled="isLoading"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
					placeholder="••••••••"
					required
				/>
			</label>

			<!-- Spazio flessibile per allinearsi con il form registrazione -->
			<div class="flex-1" />

			<!-- Azioni + link registrazione -->
			<div class="space-y-3 pt-1">
				<div class="flex flex-col gap-3 sm:flex-row">
					<button
						type="submit"
						:disabled="isLoading"
						class="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:bg-zinc-400 disabled:shadow-none"
					>
						{{ isLoading ? 'Accesso in corso...' : 'Accedi' }}
					</button>
					<RouterLink
						:to="isLoading ? '' : '/'"
						:class="isLoading && 'pointer-events-none opacity-50'"
						class="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
					>
						Torna alla home
					</RouterLink>
				</div>

				<!-- Link alla registrazione -->
				<p class="text-center text-sm text-zinc-500">
					Non hai ancora un account?
					<button
						type="button"
						class="font-semibold text-primary transition hover:text-primary-dark hover:underline"
						@click="$emit('switch-to-register')"
					>
						Registrati ora!
					</button>
				</p>
			</div>
		</form>
	</div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { loginUser } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

defineEmits(['switch-to-register', 'forgot-password'])

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
	email: '',
	password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
	errorMessage.value = ''
	successMessage.value = ''

	if (!form.email.trim()) {
		errorMessage.value = 'Email obbligatoria.'
		return
	}
	if (!form.password) {
		errorMessage.value = 'Password obbligatoria.'
		return
	}

	isLoading.value = true

	try {
		const response = await loginUser({
			email: form.email.trim(),
			password: form.password,
		})

		if (response.success) {
			authStore.login(response.data.utente, response.data.token)
			successMessage.value = '✅ Accesso effettuato! Reindirizzamento...'

			const ruolo = response.data.utente.ruolo
			setTimeout(() => {
				if (ruolo === 'dipendente comune') {
					router.push('/dashboardComune')
				} else if (ruolo === 'amministratore') {
							router.push({ name: 'admin-appartamenti' })
				} else {
					router.push('/')
				}
			}, 1000)
		} else {
			errorMessage.value = response.error || 'Credenziali non valide.'
		}
	} catch (error) {
		errorMessage.value = 'Errore di rete. Riprova più tardi.'
		console.error('Errore login:', error)
	} finally {
		isLoading.value = false
	}
}
</script>