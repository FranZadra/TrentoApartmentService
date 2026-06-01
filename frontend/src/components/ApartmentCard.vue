<template>
  <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="flex flex-col md:flex-row">
      <!-- Foto appartamento a sinistra -->
      <div class="relative h-48 w-full flex-shrink-0 bg-zinc-100 md:h-auto md:w-[280px]">
        <img
          v-if="apt.foto && apt.foto.length > 0"
          :src="apt.foto[0]"
          :alt="apt.indirizzo?.via"
          class="h-full w-full object-cover"
        >
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
          <svg class="h-11 w-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12a9 9 0 110 18 9 9 0 010-18z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16h10M9 12l3-3 3 3" />
          </svg>
          <p class="text-xs font-medium uppercase tracking-[0.2em]">Nessuna foto disponibile</p>
        </div>

        <div v-if="apt.perStudenti" class="absolute left-3 top-3 rounded-full bg-[#9a1528] px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Solo studenti
        </div>
      </div>

      <!-- Dati al centro -->
      <div class="flex-1 px-5 py-5">
        <div class="mb-3">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a1528]">
            Appartamento
          </p>
          <h3 class="mt-1 text-xl font-bold leading-tight text-zinc-900">
            {{ apt.indirizzo?.via || 'Indirizzo non disponibile' }}
          </h3>
          <p class="mt-1 text-sm text-zinc-500">
            {{ apt.indirizzo?.città || ' ' }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2 text-sm text-zinc-700">
          <span class="rounded-full bg-zinc-100 px-3 py-1">
            <strong>{{ apt.numStanze }}</strong> stanze
          </span>
          <span class="rounded-full bg-zinc-100 px-3 py-1">
            <strong>{{ apt.numBagni }}</strong> bagni
          </span>
          <span class="rounded-full bg-zinc-100 px-3 py-1">
            <strong>{{ apt.mqTot }}</strong> mq
          </span>
          <span v-if="apt.classeEnergetica" class="rounded-full bg-zinc-100 px-3 py-1">
            Classe <strong>{{ apt.classeEnergetica }}</strong>
          </span>
        </div>

        <div class="mt-3 flex flex-wrap gap-2 text-xs">
          <span v-if="apt.terrazzo" class="rounded-full bg-[#f4e4e9] px-3 py-1 font-semibold text-[#9a1528]">Terrazzo</span>
          <span v-if="apt.lavatrice" class="rounded-full bg-[#f4e4e9] px-3 py-1 font-semibold text-[#9a1528]">Lavatrice</span>
        </div>
      </div>

      <!-- Azioni a destra -->
      <div class="flex flex-row gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-5 md:flex-col md:border-l md:border-t-0 md:min-w-[170px] md:justify-center">
        <button
          @click="$emit('view')"
          class="rounded-full border border-[#9a1528] px-4 py-2 text-sm font-semibold text-[#9a1528] transition hover:bg-zinc-100"
        >
          Dettagli
        </button>
        <button
          v-if="showAnnuncioAction"
          @click="$emit('annuncio')"
          class="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          Annuncio
        </button>
        <button
          v-if="showGuastiAction"
          @click="$emit('guasti')"
          class="relative rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          {{ guastiActionLabel }}
            <span
            v-if="guastiCount > 0"
            class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#9a1528] text-[10px] font-bold leading-none text-white shadow-sm"
            >
            {{ guastiCount > 9 ? '9+' : guastiCount }}
          </span>
        </button>
        
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente card per mostrare un singolo appartamento.
// Props: apt (oggetto appartamento)
// Emissioni: view (mostra dettagli), edit (apri form modifica)

defineProps({
  apt: {
    type: Object,
    required: true,
  },
  showAnnuncioAction: {
    type: Boolean,
    default: false,
  },
  showGuastiAction: {
    type: Boolean,
    default: false,
  },
  guastiActionLabel: {
    type: String,
    default: 'Segnalazioni',
  },
  guastiCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['view', 'edit', 'annuncio', 'guasti'])
</script>

<style scoped>
/* Card styling con Tailwind; effetti hover inline */
</style>
