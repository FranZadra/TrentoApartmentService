<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app-root" class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    <header class="border-b bg-primary">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div>
            <div class="text-lg font-semibold text-white">Trento Apartment Service</div>
            <div class="text-sm text-white/80">Pannello amministratore</div>
          </div>
        </div>

        <nav class="flex items-center gap-4">
          <RouterLink to="/admin/appartamenti" class="text-sm text-[var(--color-text-primary)] hover:underline">Gestione appartamenti</RouterLink>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Minimal header styling; use Tailwind classes and CSS variables from base.css */
#app-root {
  min-height: 100vh;
}

.muted-text {
  color: var(--color-text-muted);
}

</style>
