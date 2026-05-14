<template>
  <AppLayout>
    <section class="mx-auto flex min-h-[70vh] max-w-[1200px] items-center px-6 py-16 lg:px-8">
      <div class="max-w-2xl rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#9a1528]">
          {{ eyebrow }}
        </p>
        <h1 class="mt-4 font-display text-5xl font-bold text-zinc-900">
          {{ title }}
        </h1>
        <p class="mt-4 max-w-xl text-base leading-8 text-zinc-600">
          {{ description }}
        </p>
        <router-link
          to="/"
          class="mt-8 inline-flex items-center rounded-full bg-[#9a1528] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7f1020]"
        >
          Torna alla home
        </router-link>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'

defineProps({
  eyebrow: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>