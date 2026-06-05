<template>
  <!-- Overlay sfondo modale -->
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        @click="close"
      />
    </transition>

    <!-- Modale filtri -->
    <transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-white shadow-2xl"
      >
        <!-- Header modale dei filtri -->
        <div class="flex items-center justify-between border-b border-zinc-200 p-6">
          <h2 class="font-display text-2xl font-bold text-zinc-900">Filtra ricerca</h2>
          <button
            @click="close"
            class="rounded-full p-2 hover:bg-zinc-100"
            aria-label="Chiudi filtri"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenuto filtri -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-8 max-w-2xl">
            <!-- Sezione appartamento -->
            <div>
              <h3 class="mb-4 font-semibold text-zinc-900">Appartamento</h3>
              <div class="space-y-4">
                <!-- Numero stanze -->
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">
                    Numero stanze
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model.number="filtri.numStanze"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Es. 3"
                      class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                    />
                  </div>
                </div>

                <!-- Numero bagni -->
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">
                    Numero bagni
                  </label>
                  <input
                    v-model.number="filtri.numBagni"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Es. 2"
                    class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                  />
                </div>

                <!-- Terrazzo -->
                <div class="flex items-center gap-3">
                  <input
                    v-model="filtri.terrazzo"
                    type="checkbox"
                    id="terrazzo"
                    class="h-4 w-4 rounded border-zinc-300 text-[#9a1528] focus:ring-[#9a1528]"
                  />
                  <label for="terrazzo" class="text-sm font-medium text-zinc-700 cursor-pointer">
                    Ha terrazzo
                  </label>
                </div>

                <!-- Classe energetica -->
                <div>
                  <label for="classe" class="block text-sm font-medium text-zinc-700 mb-2">
                    Classe energetica
                  </label>
                  <select
                    v-model="filtri.classeEnergetica"
                    id="classe"
                    class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                  >
                    <option value="">Qualsiasi</option>
                    <option value="A4">A4 (Eccellente)</option>
                    <option value="A3">A3 (Eccellente)</option>
                    <option value="A2">A2 (Eccellente)</option>
                    <option value="A1">A1 (Eccellente)</option>
                    <option value="B">B (Molto buono)</option>
                    <option value="C">C (Buono)</option>
                    <option value="D">D (Medio)</option>
                    <option value="E">E (Scarso)</option>
                    <option value="F">F (Molto scarso)</option>
                    <option value="G">G (Pessimo)</option>
                  </select>
                </div>

                <!-- Metri quadri -->
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">
                    Metri quadri
                  </label>
                  <div class="flex gap-3 items-end">
                    <div class="flex-1">
                      <label for="mqMin" class="text-xs text-zinc-500">Da</label>
                      <input
                        v-model.number="filtri.mqMin"
                        id="mqMin"
                        type="number"
                        min="0"
                        placeholder="Min"
                        class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                      />
                    </div>
                    <div class="flex-1">
                      <label for="mqMax" class="text-xs text-zinc-500">A</label>
                      <input
                        v-model.number="filtri.mqMax"
                        id="mqMax"
                        type="number"
                        min="0"
                        placeholder="Max"
                        class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sezione camere -->
            <div>
              <h3 class="mb-4 font-semibold text-zinc-900">Camere</h3>
              <div class="space-y-4">
                <!-- Tipo camera -->
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">
                    Tipo camera
                  </label>
                  <select
                    v-model="filtri.tipoCam"
                    class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                  >
                    <option value="">Qualsiasi</option>
                    <option value="SINGOLA">Singola</option>
                    <option value="DOPPIA">Doppia</option>
                  </select>
                </div>

                <!-- Prezzo -->
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">
                    Prezzo camera (€/mese)
                  </label>
                  <div class="flex gap-3 items-end">
                    <div class="flex-1">
                      <label for="prezzoMin" class="text-xs text-zinc-500">Da</label>
                      <input
                        v-model.number="filtri.prezzoMin"
                        id="prezzoMin"
                        type="number"
                        min="0"
                        placeholder="Min"
                        class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                      />
                    </div>
                    <div class="flex-1">
                      <label for="prezzoMax" class="text-xs text-zinc-500">A</label>
                      <input
                        v-model.number="filtri.prezzoMax"
                        id="prezzoMax"
                        type="number"
                        min="0"
                        placeholder="Max"
                        class="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-[#9a1528] focus:outline-none focus:ring-1 focus:ring-[#9a1528]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer con pulsanti -->
        <div class="border-t border-zinc-200 bg-zinc-50 p-6 flex gap-3">
          <button
            @click="resetFiltri"
            class="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Resetta
          </button>
          <button
            @click="applica"
            class="flex-1 rounded-lg bg-[#9a1528] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7f1020]"
          >
            Applica filtri
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  filtriAttuali: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close', 'apply'])

// Stato locale dei filtri
const filtri = ref({
  numStanze: null,
  numBagni: null,
  terrazzo: false,
  classeEnergetica: '',
  mqMin: null,
  mqMax: null,
  tipoCam: '',
  prezzoMin: null,
  prezzoMax: null,
})

// Quando la modale si apre, popola i filtri con quelli attuali.
// I campi assenti in filtriAttuali rimangono al loro valore iniziale (null, '', false)
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      filtri.value = {
        numStanze: null,
        numBagni: null,
        terrazzo: false,
        classeEnergetica: '',
        mqMin: null,
        mqMax: null,
        tipoCam: '',
        prezzoMin: null,
        prezzoMax: null,
        ...props.filtriAttuali,
      }
    }
  }
)

function close() {
  emit('close')
}

function resetFiltri() {
  filtri.value = {
    numStanze: null,
    numBagni: null,
    terrazzo: false,
    classeEnergetica: '',
    mqMin: null,
    mqMax: null,
    tipoCam: '',
    prezzoMin: null,
    prezzoMax: null,
  }
}

function applica() {
  // Filtra i valori nulli/vuoti per evitare di mandare parametri inutili
  const filtriDaInviare = Object.entries(filtri.value).reduce((acc, [key, value]) => {
    if (value !== null && value !== '' && value !== false) {
      acc[key] = value
    }
    return acc
  }, {})

  emit('apply', filtriDaInviare)
  close()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
