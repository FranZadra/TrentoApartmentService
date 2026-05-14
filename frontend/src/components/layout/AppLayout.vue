<template>
	<!-- Wrapper di ogni pagina: header in cima, contenuto nel mezzo, footer in fondo -->
	<div class="min-h-screen bg-white text-zinc-900">
		<AppHeader />

		<main>
			<slot />
		</main>

		<AppFooter />
	</div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>
