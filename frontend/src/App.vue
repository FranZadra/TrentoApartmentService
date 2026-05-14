<script setup>
import { RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
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
