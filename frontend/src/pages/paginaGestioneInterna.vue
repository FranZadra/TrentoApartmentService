<template>
    <AppLayout>
  <main class="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Gestione interna</p>
        <h1 class="mt-2 text-3xl font-display text-zinc-900 sm:text-4xl">I tuoi contratti</h1>
      </header>

      <div v-if="isLoading" class="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-600 shadow-sm">
        Caricamento contratti in corso...
      </div>

      <div v-else-if="errorMessage" class="w-full rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
        {{ errorMessage }}
      </div>

      <div v-else class="w-full space-y-8">
        <div v-if="!contratti.length" class="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 shadow-sm">
          Non hai alcun contratto registrato a tuo nome.
        </div>

        <div v-else-if="contrattoAttivo" class="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
          <div class="w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Appartamento attuale</p>
            <h2 class="mt-2 text-2xl font-display text-zinc-900">
              {{ indirizzoCompleto(contrattoAttivo?.idAppartamento) }}
            </h2>

            <div class="mt-4 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
              <div class="rounded-2xl bg-white px-4 py-3">Stanze: <strong>{{ contrattoAttivo?.idAppartamento?.numStanze ?? '—' }}</strong></div>
              <div class="rounded-2xl bg-white px-4 py-3">Bagni: <strong>{{ contrattoAttivo?.idAppartamento?.numBagni ?? '—' }}</strong></div>
              <div class="rounded-2xl bg-white px-4 py-3">Canone mensile: <strong>€ {{ contrattoAttivo?.canoneMensile ?? '—' }}</strong></div>
              <div class="rounded-2xl bg-white px-4 py-3">Stato: <strong>{{ contrattoAttivo?.stato }}</strong></div>
            </div>

            <div class="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                :disabled="!appartamentoAttivo"
                class="rounded-full px-5 py-3 text-sm font-semibold text-white transition"
                :class="appartamentoAttivo ? 'bg-primary hover:bg-primary-dark' : 'cursor-not-allowed bg-zinc-300 text-zinc-600'"
                @click="vaiAGuasti"
              >
                Segnala un guasto
              </button>
            </div>
            <div v-if="successMessage" class="mt-4 rounded-md bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
              {{ successMessage }}
            </div>

            <div v-if="guastiAttivi.length" class="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Segnalazioni attive</p>
              <ul class="space-y-3">
                <li v-for="g in guastiAttivi" :key="g._id" class="flex items-start gap-3">
                  <div class="flex-1">
                    <div class="flex items-baseline justify-between gap-3">
                      <strong class="text-zinc-900">{{ g.categoria || 'Altro' }} — {{ g.priorita || g.priorità || 'media' }}</strong>
                      <span class="text-xs text-zinc-500">{{ new Date(g.createdAt || g.dataSegnalazione).toLocaleDateString('it-IT') }}</span>
                    </div>
                    <p class="mt-1 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-1 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-else class="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-600 shadow-sm">
          Non hai un contratto attivo al momento. Puoi consultare solo i contratti passati.
        </div>

        <div v-if="contrattiPassati.length" class="mx-auto w-full max-w-4xl">
          <button
            type="button"
            class="mb-4 text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
            @click="mostraPassati = !mostraPassati"
          >
            {{ mostraPassati ? 'Nascondi contratti passati' : 'Mostra contratti passati' }}
          </button>

          <transition name="fade">
            <div v-if="mostraPassati" class="grid gap-4">
              <article
                v-for="contratto in contrattiPassati"
                :key="contratto._id"
                class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Contratto passato</p>
                <h3 class="mt-2 text-lg font-semibold text-zinc-900">
                  {{ indirizzoCompleto(contratto.idAppartamento) }}
                </h3>
                <p class="mt-1 text-sm text-zinc-600">
                  {{ formattaPeriodo(contratto.dataInizio, contratto.dataFine) }}
                </p>
                <p class="mt-2 text-sm text-zinc-700">
                  Canone mensile: <strong>€ {{ contratto.canoneMensile }}</strong>
                </p>
              </article>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </main>

  <GuastoForm
    v-if="showGuastoForm"
    :apartment="appartamentoAttivo"
    @saved="onGuastoSaved"
    @close="closeGuastoForm"
  />
</AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getContrattiUtenteLoggato, getGuastiAppartamento } from '../services/gestioneInternaService'
import GuastoForm from '@/components/GuastoForm.vue'

const contratti = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const mostraPassati = ref(false)
const showGuastoForm = ref(false)
const guastiAttivi = ref([])
const successMessage = ref('')

const contrattoAttivo = computed(() => contratti.value.find((contratto) => contratto.stato === 'attivo') || null)
const contrattiPassati = computed(() => contratti.value.filter((contratto) => contratto.stato !== 'attivo'))
const appartamentoAttivo = computed(() => contrattoAttivo.value?.idAppartamento || null)

watch(showGuastoForm, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function indirizzoCompleto(appartamento) {
  if (!appartamento?.indirizzo) return 'Indirizzo non disponibile'
  const { via, numero, città } = appartamento.indirizzo
  return `${via || 'Via sconosciuta'} ${numero || ''}${città ? `, ${città}` : ''}`.trim()
}

function formattaPeriodo(inizio, fine) {
  const start = inizio ? new Date(inizio).toLocaleDateString('it-IT') : '—'
  const end = fine ? new Date(fine).toLocaleDateString('it-IT') : '—'
  return `${start} — ${end}`
}

function vaiAGuasti() {
  if (!appartamentoAttivo.value) return
  showGuastoForm.value = true
}

function closeGuastoForm() {
  showGuastoForm.value = false
}

function onGuastoSaved(payload) {
  // payload may contain created guasto
  closeGuastoForm()
  successMessage.value = 'Segnalazione registrata con successo.'
  setTimeout(() => (successMessage.value = ''), 4000)
  // ricarica i guasti visibili
  loadGuasti()
}

async function loadGuasti() {
  guastiAttivi.value = []
  const app = appartamentoAttivo.value
  if (!app) return
  const appId = typeof app === 'string' ? app : (app._id || app.id || '')
  if (!appId) return
  const res = await getGuastiAppartamento(appId)
  if (res.success) {
    guastiAttivi.value = res.data?.data || []
  }
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

watch(contrattoAttivo, (value) => {
  if (!value) showGuastoForm.value = false
  // quando cambia il contratto attivo, carica i guasti relativi
  if (value) loadGuasti()
})

async function caricaContratti() {
  isLoading.value = true
  errorMessage.value = ''

  const response = await getContrattiUtenteLoggato()
  if (response.success) {
    contratti.value = response.data?.contratti ?? []
    // se c'è un contratto attivo, carica i guasti
    if (contratti.value && contratti.value.length) {
      const ca = contratti.value.find((c) => c.stato === 'attivo')
      if (ca) await loadGuasti()
    }
  } else {
    errorMessage.value = response.error
  }

  isLoading.value = false
}

onMounted(caricaContratti)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>