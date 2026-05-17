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
									Registrati per accedere ai servizi della piattaforma in un ambiente elegante, leggibile e coerente con il brand.
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
	</main>
</template>

<script setup>
import { ref } from 'vue'
import FormLogin from '../components/formLogin.vue'
import FormRegistrazione from '../components/formRegistrazione.vue'
import castello from '../assets/images/TrentoCastello.jpg'
import logoComune from '../assets/images/logoComuneW.png'
import logoUni from '../assets/images/logoUnitnW.png'

// Se l'URL contiene ?view=register, la pagina parte già sulla scheda di registrazione.
import { useRoute } from 'vue-router'
const route = useRoute()
const view = ref(route.query.view === 'register' ? 'register' : 'login')
</script>