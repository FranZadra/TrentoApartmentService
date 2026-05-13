<template>
	<footer class="border-t border-[#7f1020] bg-[#9a1528] text-white">
		<div class="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-8 text-sm text-white/90 sm:flex-row sm:items-end sm:justify-between lg:px-8">
			<div>
				<img
					:src="tasLogo"
					alt="Trento Apartment Service"
					class="h-10 w-auto object-contain"
				/>
				<p class="mt-1 text-xs uppercase tracking-[0.28em] text-white/80">
					Trento Apartment Service
				</p>
			</div>

			<p>Copyright 2026 TAS</p>
		</div>
	</footer>
</template>

<script setup>
import tasLogo from '../../assets/images/TasLogo.png'
</script>
