<template>
  <!-- Card cliccabile che mostra il riepilogo di un annuncio nella lista -->
  <router-link
    :to="{ name: 'annuncio-detail', params: { id: annuncio._id } }"
    class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
  >
    <!-- Immagine di anteprima (TC33: placeholder se non ci sono foto) -->
    <div class="relative h-48 w-full overflow-hidden bg-zinc-100">
      <img
        v-if="primaFoto"
        :src="primaFoto"
        :alt="`Foto di ${indirizzoBreve}`"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <!-- Placeholder: icona casa se nessuna foto disponibile -->
      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z" />
        </svg>
        <span class="text-xs font-medium">Nessuna foto disponibile</span>
      </div>

      <!-- Badge "Solo studenti" se applicabile -->
      <span
        v-if="annuncio.appartamento?.studentOnly"
        class="absolute left-3 top-3 rounded-full bg-[#9a1528] px-3 py-1 text-xs font-semibold text-white"
      >
        Solo studenti
      </span>
    </div>

    <!-- Corpo della card -->
    <div class="flex flex-1 flex-col gap-3 p-4">
      <!-- Indirizzo come titolo -->
      <h3 class="font-display text-base font-bold text-zinc-900 leading-snug">
        {{ indirizzoBreve }}
      </h3>

      <!-- Descrizione troncata a 2 righe -->
      <p class="line-clamp-2 text-sm text-zinc-500 leading-relaxed">
        {{ annuncio.descrizione }}
      </p>

      <!-- Caratteristiche principali dell'appartamento -->
      <div class="mt-auto flex flex-wrap gap-2 pt-2">
        <span class="chip">{{ annuncio.appartamento?.numStanze }} stanze</span>
        <span class="chip">{{ annuncio.appartamento?.numBagni }} bagni</span>
        <span v-if="annuncio.appartamento?.terrazzo" class="chip">Terrazzo</span>
        <span v-if="annuncio.appartamento?.lavatrice" class="chip">Lavatrice</span>
        <span
          v-if="annuncio.appartamento?.classeEnergetica"
          class="chip bg-emerald-50 text-emerald-700"
        >
          Classe {{ annuncio.appartamento.classeEnergetica }}
        </span>
      </div>

      <!-- Data di pubblicazione -->
      <p class="text-xs text-zinc-400">
        Pubblicato il {{ dataFormattata }}
      </p>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // L'oggetto annuncio completo con appartamento popolato dal backend
  annuncio: {
    type: Object,
    required: true,
  },
})

// Prima foto dell'appartamento, oppure null se l'array è vuoto
const primaFoto = computed(() => props.annuncio.appartamento?.foto?.[0] ?? null)

// Indirizzo leggibile: "Via Manci 5, Trento"
const indirizzoBreve = computed(() => {
  const a = props.annuncio.appartamento?.indirizzo
  if (!a) return 'Indirizzo non disponibile'
  return `${a.via} ${a.numero}, ${a.città}`
})

// Data in formato italiano: "1 mag 2026"
const dataFormattata = computed(() => {
  if (!props.annuncio.dataPubbl) return ''
  return new Date(props.annuncio.dataPubbl).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})
</script>

<style scoped>
/* Chip: etichetta piccola per le caratteristiche dell'appartamento */
.chip {
  @apply rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600;
}
</style>
