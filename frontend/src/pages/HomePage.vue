<template>
  <AppLayout>
    <!-- La home mostra il banner iniziale e le funzioni principali della piattaforma. -->
    <HeroSection />
    <FeatureSection />
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import FeatureSection from '@/components/home/FeatureSection.vue'
</script>
