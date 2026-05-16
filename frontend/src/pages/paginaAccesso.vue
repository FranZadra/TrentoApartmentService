<template>
	<main class="relative min-h-screen overflow-hidden bg-zinc-950">
		<div
			class="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
			:style="{ backgroundImage: `url(${castello})` }"
			aria-hidden="true"
		/>
		<div class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-primary/45" aria-hidden="true" />

		<section class="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
			<div class="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1fr_1.05fr]">
				<div class="flex flex-col justify-between gap-8 p-8 text-white sm:p-10 lg:p-12">
					<div class="space-y-5">
						<div class="space-y-3">
							<p class="font-display text-xs uppercase tracking-[0.35em] text-white/75">Trento Apartment Service</p>
							<h1 class="font-display text-4xl leading-tight sm:text-5xl">
								Crea il tuo account TAS
							</h1>
                            <hr class="border-white/20" />
							<p class="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
								Registrati per accedere ai servizi della piattaforma in un ambiente elegante, leggibile e coerente con il brand.
							</p>
						</div>
					</div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <img :src="logoComune" alt="Comune di Trento" class="h-16 w-50 object-contain" />
                        <img :src="logoUniversity" alt="Università di Trento" class="h-16 w-50 object-contain" />
                    </div>
				</div>

				<div class="bg-white/95 p-6 sm:p-8 lg:p-10">
					<FormRegistrazione />
				</div>
			</div>
		</section>
	</main>
</template>

<script setup>
import FormRegistrazione from '../components/formRegistrazione.vue'
import castello from '../assets/images/TrentoCastello.jpg'
import logo from '../assets/images/TasLogo.png'
import logoComune from '../assets/images/logoComuneW.png'
import logoUniversity from '../assets/images/logoUnitnW.png'
</script>
