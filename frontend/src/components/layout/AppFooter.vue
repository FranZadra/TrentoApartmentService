<template>
	<!-- Footer per tutte la pagine del sito -->
	<footer class="border-t border-[#7f1020] bg-[#9a1528] text-white">
		<div class="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 text-sm text-white/90 lg:px-8">
			<div class="flex items-start justify-between gap-6">
				<!-- Logo TAS -->
				<div class="flex flex-col gap-2">
					<img
						:src="tasLogo"
						alt="Trento Apartment Service"
						class="h-10 w-auto object-contain"
					/>
					<p class="text-xs uppercase tracking-[0.28em] text-white/80">
						Trento Apartment Service
					</p>
				</div>

				<!-- Loghi del comune e dell'Università -->
				<div class="flex items-center gap-5">
					<img
						:src="logoComune"
						alt="Comune di Trento"
						class="h-12 w-auto object-contain"
					/>
					<img
						:src="logoUnitn"
						alt="Università di Trento"
						class="h-12 w-auto object-contain"
					/>
				</div>
			</div>

			<p class="text-center text-xs uppercase tracking-[0.28em] text-white/80">
				Copyright 2026 TAS
			</p>
		</div>
	</footer>
</template>

<script setup>
import tasLogo from '../../assets/images/TasLogo.png'
import logoComune from '../../assets/images/logoComuneW.png'
import logoUnitn from '../../assets/images/logoUnitnW.png'
</script>
