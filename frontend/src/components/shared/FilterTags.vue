<template>
  <!-- Mostra i filtri attivi come tag removibili -->
  <div v-if="filtriFormatted.length > 0" class="mb-6 flex flex-wrap gap-2">
    <div
      v-for="(filtro, index) in filtriFormatted"
      :key="index"
      class="flex items-center gap-2 rounded-full bg-[#9a1528] px-3 py-2 text-sm font-medium text-white"
    >
      <span>{{ filtro.label }}: {{ filtro.value }}</span>
      <button
        @click="removeFiltro(filtro.key)"
        class="ml-1 rounded-full hover:bg-[#7f1020] p-1"
        :aria-label="`Rimuovi filtro ${filtro.label}`"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Pulsante "Cancella tutti i filtri" -->
    <button
      @click="cancellaEverything"
      class="rounded-full border-2 border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
    >
      Cancella tutto
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filtri: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['remove-filter', 'clear-all'])

// Mappa ogni filtro a una label leggibile
const labelMappa = {
  numStanze: 'Stanze',
  numBagni: 'Bagni',
  terrazzo: 'Terrazzo',
  classeEnergetica: 'Classe energetica',
  mqMin: 'Mq minimo',
  mqMax: 'Mq massimo',
  tipoCam: 'Tipo camera',
  prezzoMin: 'Prezzo minimo',
  prezzoMax: 'Prezzo massimo',
}

// Formatta i filtri per la visualizzazione
const filtriFormatted = computed(() => {
  return Object.entries(props.filtri)
    .filter(([_, value]) => value !== null && value !== '' && value !== false)
    .map(([key, value]) => {
      let displayValue = value
      if (key === 'tipoCam') {
        displayValue = value === 'SINGOLA' ? 'Singola' : 'Doppia'
      } else if (key === 'terrazzo') {
        displayValue = 'Sì'
      }
      return {
        key,
        label: labelMappa[key] || key,
        value: displayValue,
      }
    })
})

function removeFiltro(key) {
  emit('remove-filter', key)
}

function cancellaEverything() {
  emit('clear-all')
}
</script>
