<template>
	<!-- Sezione iniziale con il messaggio principale e l'immagine di Trento. -->
	<section class="relative overflow-hidden bg-white">
		<div class="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
			<div class="flex flex-col justify-center gap-8">
				<div class="max-w-2xl space-y-6">
					<p class="text-4xl font-bold leading-none text-zinc-900 sm:text-4xl lg:text-5xl">
						Benvenuti sul portale Trento Apartment Service!
					</p>
					<p class="max-w-xl text-lg leading-8 text-zinc-700 sm:text-xl">
						La piattaforma che digitalizza l'intero ciclo di vita della tua prossima locazione
					</p>
				</div>

				<div class="flex flex-wrap gap-4">
					<router-link
						to="/annunci"
						class="inline-flex items-center justify-center rounded-full bg-[#9a1528] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(154,21,40,0.2)] hover:bg-[#7f1020]"
					>
						Cerca appartamento
					</router-link>
					<a
						href="#features"
						class="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 hover:border-[#9a1528] hover:text-[#9a1528]"
					>
						Scopri le funzioni
					</a>
					<!-- Pulsante visibile solo ai dipendenti comunali (US16) -->
					<router-link
						v-if="isDipendenteComunale"
						to="/dashboard-statistica"
						class="inline-flex items-center justify-center rounded-full border border-[#9a1528] px-6 py-3 text-sm font-semibold text-[#9a1528] hover:bg-[#9a1528] hover:text-white"
					>
						TAS Data
					</router-link>
				</div>

				<div class="grid gap-4 pt-4 sm:grid-cols-3">
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">01</p>
						<p class="mt-2 text-sm text-zinc-600">Ricerca e visualizzazione annunci</p>
					</div>
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">02</p>
						<p class="mt-2 text-sm text-zinc-600">Task interni e organizzazione condivisa</p>
					</div>
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">03</p>
						<p class="mt-2 text-sm text-zinc-600">Guasti, ticket e manutenzioni tracciate</p>
					</div>
				</div>
			</div>

			<div class="relative flex items-center justify-center">
				<div class="absolute left-0 top-12 h-24 w-24 rounded-full bg-[#9a1528]/10 blur-2xl"></div>
				<div class="absolute bottom-12 right-4 h-32 w-32 rounded-full bg-[#9a1528]/15 blur-3xl"></div>

				<div class="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
					<div class="relative min-h-[28rem] overflow-hidden rounded-[1.5rem] bg-zinc-900">
						<img
							:src="trentoDuomo"
							alt="Trento Duomo"
							class="h-full min-h-[28rem] w-full object-cover"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-[#1f0a10]/45 via-transparent to-transparent"></div>
						<div class="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528] shadow-sm backdrop-blur">
							Trento
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
import { computed } from 'vue'
import trentoDuomo from '../../assets/images/TrentoDuomo.jpg'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const isDipendenteComunale = computed(() => auth.user?.ruolo === 'dipendente comune')
</script>