<template>
	<footer class="border-t border-[#7f1020] bg-[#9a1528] text-white">
		<div class="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-6 text-sm text-white/90 sm:px-6 lg:px-8">
			<div class="flex items-start justify-between gap-6">
				<!-- Logo TAS -->
				<div class="flex flex-col gap-2">
					<img
						:src="tasLogo"
						alt="Trento Apartment Service"
						class="h-9 w-auto object-contain sm:h-10"
					/>
					<p class="text-xs uppercase tracking-[0.28em] text-white/80">
						Trento Apartment Service
					</p>
				</div>

				<!-- Loghi istituzionali -->
				<div class="flex items-center gap-5">
					<img
						:src="logoComune"
						alt="Comune di Trento"
						class="h-10 w-auto object-contain sm:h-12"
					/>
					<img
						:src="logoUnitn"
						alt="Università di Trento"
						class="h-10 w-auto object-contain sm:h-12"
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
