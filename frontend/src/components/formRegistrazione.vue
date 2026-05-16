<template>
	<div class="flex min-h-[580px] flex-col space-y-5">
		<!-- Header -->
		<div class="space-y-1">
			<p class="font-display text-sm uppercase tracking-[0.25em] text-primary">Registrazione</p>
			<h2 class="font-display text-3xl text-zinc-900">Crea il tuo profilo</h2>
			<p class="text-sm leading-6 text-zinc-600">
				Seleziona il tipo di account e inserisci i dati richiesti.
			</p>
		</div>

		<!-- Tab selector -->
		<div class="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 gap-1">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				type="button"
				@click="activeTab = tab.key"
				:class="[
					'flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200',
					activeTab === tab.key
						? 'bg-white text-primary shadow-sm ring-1 ring-zinc-200'
						: 'text-zinc-500 hover:text-zinc-700',
				]"
			>
				{{ tab.label }}
			</button>
		</div>

		<form class="flex flex-1 flex-col space-y-4" @submit.prevent="handleSubmit">
			<!-- Messaggi -->
			<div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				{{ errorMessage }}
			</div>
			<div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
				{{ successMessage }}
			</div>

			<!-- Nome + Cognome -->
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

			<!-- Spazio flessibile che tiene la card stabile tra le tab -->
			<div class="flex-1">
				<!-- ── TAB: Amministratore ── -->
				<div v-if="activeTab === 'amministratore'" class="space-y-4">
					<div class="space-y-2">
						<span class="text-sm font-semibold text-zinc-700">Tipo account</span>
						<div class="flex gap-3">
							<label
								v-for="opt in tipoAmminOptions"
								:key="String(opt.value)"
								:class="[
									'flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition',
									form.privato === opt.value
										? 'border-primary bg-primary/5 ring-2 ring-primary/20'
										: 'border-zinc-200 bg-white hover:border-zinc-300',
								]"
							>
								<input
									type="radio"
									:value="opt.value"
									v-model="form.privato"
									:disabled="isLoading"
									class="accent-primary"
								/>
								<span class="text-sm font-medium text-zinc-700">{{ opt.label }}</span>
							</label>
						</div>
					</div>

					<transition
						enter-active-class="transition duration-200 ease-out"
						enter-from-class="opacity-0 -translate-y-1"
						enter-to-class="opacity-100 translate-y-0"
						leave-active-class="transition duration-150 ease-in"
						leave-from-class="opacity-100 translate-y-0"
						leave-to-class="opacity-0 -translate-y-1"
					>
						<label v-if="form.privato === false" class="block space-y-2">
							<span class="text-sm font-semibold text-zinc-700">
								Partita IVA <span class="text-red-500">*</span>
							</span>
							<input
								v-model="form.pIVA"
								type="text"
								:disabled="isLoading"
								maxlength="11"
								class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-mono text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
								placeholder="12345678901"
								required
							/>
						</label>
					</transition>
				</div>

				<!-- ── TAB: Dipendente comunale ── -->
				<div v-else-if="activeTab === 'dipendente'" class="grid gap-4 sm:grid-cols-2">
					<label class="space-y-2">
						<span class="text-sm font-semibold text-zinc-700">Ruolo</span>
						<input
							v-model="form.ruolo"
							type="text"
							:disabled="isLoading"
							class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
							placeholder="es. Responsabile affitti"
							required
						/>
					</label>
					<label class="space-y-2">
						<span class="text-sm font-semibold text-zinc-700">Dipartimento</span>
						<input
							v-model="form.dipartimento"
							type="text"
							:disabled="isLoading"
							class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-zinc-100 disabled:text-zinc-500"
							placeholder="es. Ufficio Casa"
							required
						/>
					</label>
				</div>
			</div>

			<!-- Azioni + link login -->
			<div class="space-y-3 pt-1">
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

				<!-- Link al login -->
				<p class="text-center text-sm text-zinc-500">
					Hai già un account?
					<button
						type="button"
						class="font-semibold text-primary transition hover:text-primary-dark hover:underline"
						@click="$emit('switch-to-login')"
					>
						Effettua l'accesso!
					</button>
				</p>
			</div>
		</form>
	</div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registerUser } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

defineEmits(['switch-to-login'])

const router = useRouter()
const authStore = useAuthStore()

const tabs = [
	{ key: 'utente', label: 'Utente' },
	{ key: 'amministratore', label: 'Amministratore' },
	{ key: 'dipendente', label: 'Dipendente comunale' },
]

const activeTab = ref('utente')

const tipoAmminOptions = [
	{ value: true, label: 'Privato' },
	{ value: false, label: 'Agenzia' },
]

const form = reactive({
	nome: '',
	cognome: '',
	email: '',
	password: '',
	confirmPassword: '',
	// amministratore
	privato: true,
	pIVA: '',
	// dipendente
	ruolo: '',
	dipartimento: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

watch(activeTab, () => {
	errorMessage.value = ''
	successMessage.value = ''
	form.privato = true
	form.pIVA = ''
	form.ruolo = ''
	form.dipartimento = ''
})

watch(() => form.privato, (val) => {
	if (val === true) form.pIVA = ''
})

async function handleSubmit() {
	errorMessage.value = ''
	successMessage.value = ''

	if (!form.nome.trim() || !form.cognome.trim() || !form.email.trim()) {
		errorMessage.value = 'Nome, cognome ed email sono obbligatori.'
		return
	}
	if (!form.password || !form.confirmPassword) {
		errorMessage.value = 'Le password non possono essere vuote.'
		return
	}
	if (form.password !== form.confirmPassword) {
		errorMessage.value = 'Le password non corrispondono.'
		return
	}
	if (form.password.length < 6) {
		errorMessage.value = 'La password deve contenere almeno 6 caratteri.'
		return
	}
	if (activeTab.value === 'amministratore' && form.privato === false) {
		if (!form.pIVA.trim()) {
			errorMessage.value = 'La partita IVA è obbligatoria per le agenzie.'
			return
		}
		if (!/^\d{11}$/.test(form.pIVA.trim())) {
			errorMessage.value = 'La partita IVA deve essere composta da 11 cifre.'
			return
		}
	}
	if (activeTab.value === 'dipendente') {
		if (!form.ruolo.trim() || !form.dipartimento.trim()) {
			errorMessage.value = 'Ruolo e dipartimento sono obbligatori.'
			return
		}
	}

	isLoading.value = true

	try {
		const basePayload = {
			nome: form.nome.trim(),
			cognome: form.cognome.trim(),
			email: form.email.trim(),
			password: form.password,
		}

		let userData = {}

		if (activeTab.value === 'utente') {
			userData = { ...basePayload, ruolo: 'utente base' }
		} else if (activeTab.value === 'amministratore') {
			userData = {
				...basePayload,
				ruolo: 'amministratore',
				privato: form.privato,
				...(form.privato === false && { pIVA: form.pIVA.trim() }),
			}
		} else if (activeTab.value === 'dipendente') {
			userData = {
				...basePayload,
				ruolo: 'dipendente comune',
				ruoloDipendente: form.ruolo.trim(),
				dipartimento: form.dipartimento.trim(),
			}
		}

		const response = await registerUser(userData)

		if (response.success) {
			authStore.login(response.data.utente, response.data.token)
			successMessage.value = '✅ Registrazione completata! Reindirizzamento...'

			const ruolo = response.data.utente.ruolo
			setTimeout(() => {
				if (ruolo === 'dipendente comune') {
					router.push('/dashboardComune')
				} else if (ruolo === 'amministratore') {
					router.push('/gestioneAppartamenti')
				} else {
					router.push('/')
				}
			}, 1000)
		} else {
			errorMessage.value = response.error || 'Errore durante la registrazione.'
		}
	} catch (error) {
		errorMessage.value = 'Errore di rete. Riprova più tardi.'
		console.error('Errore registrazione:', error)
	} finally {
		isLoading.value = false
	}
}
</script>