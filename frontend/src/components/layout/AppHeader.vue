<template>
	<header class="sticky top-0 z-40 border-b border-[#7f1020] bg-[#9a1528] text-white shadow-sm">
		<div class="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
			<!-- Logo + nome brand -->
			<router-link to="/" class="group flex items-center gap-3">
				<img
					:src="tasLogo"
					alt="Trento Apartment Service"
					class="h-11 w-auto object-contain transition-transform group-hover:-translate-y-0.5"
				/>
				<div class="hidden sm:block">
					<p class="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-white/80">
						Trento Apartment Service
					</p>
				</div>
			</router-link>

			<!-- Navigazione principale -->
			<nav class="flex items-center gap-6 text-sm font-semibold text-white sm:gap-8">
				<router-link to="/" class="text-white/90 hover:text-white">Home</router-link>
				<router-link to="/annunci" class="text-white/90 hover:text-white">
					Ricerca appartamento
				</router-link>
				<router-link
					:to="isLoggedIn ? '/profilo' : '/accesso'"
					class="rounded-full border border-white px-4 py-2 text-white transition-colors hover:bg-white hover:text-[#9a1528]"
				>
					{{ isLoggedIn ? 'Profilo' : 'Accedi' }}
				</router-link>
			</nav>
		</div>
	</header>
</template>

<script setup>
import tasLogo from '../../assets/images/TasLogo.png'
import { useAuthStore } from '@/stores/authStore'
import { ref, computed } from 'vue'

const auth = useAuthStore()
const isLoggedIn = computed(() => !!auth.token)
</script>
