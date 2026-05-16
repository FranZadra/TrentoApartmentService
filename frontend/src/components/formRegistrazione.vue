<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<div class="space-y-2">
			<p class="font-display text-sm uppercase tracking-[0.25em] text-primary">Registrazione</p>
			<h2 class="font-display text-3xl text-zinc-900">Crea il tuo profilo</h2>
			<p class="text-sm leading-6 text-zinc-600">
				Inserisci i dati richiesti per creare il tuo account.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Nome</span>
				<input
					v-model="form.nome"
					type="text"
					autocomplete="given-name"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					placeholder="Mario"
				/>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Cognome</span>
				<input
					v-model="form.cognome"
					type="text"
					autocomplete="family-name"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					placeholder="Rossi"
				/>
			</label>
		</div>

		<label class="block space-y-2">
			<span class="text-sm font-semibold text-zinc-700">Email</span>
			<input
				v-model="form.email"
				type="email"
				autocomplete="email"
				class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
				placeholder="nome@example.com"
			/>
		</label>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Password</span>
				<input
					v-model="form.password"
					type="password"
					autocomplete="new-password"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					placeholder="••••••••"
				/>
			</label>

			<label class="space-y-2">
				<span class="text-sm font-semibold text-zinc-700">Conferma password</span>
				<input
					v-model="form.confirmPassword"
					type="password"
					autocomplete="new-password"
					class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					placeholder="••••••••"
				/>
			</label>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row">
			<button
				type="submit"
				class="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
			>
				Registrati
			</button>

			<RouterLink
				to="/"
				class="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
			>
				Torna alla home
			</RouterLink>
		</div>
	</form>
</template>

<script setup>
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'

const form = reactive({
	nome: '',
	cognome: '',
	email: '',
	password: '',
	confirmPassword: '',
})

function handleSubmit() {
	// La logica di registrazione sarà collegata al backend in un secondo momento.
}
</script>
