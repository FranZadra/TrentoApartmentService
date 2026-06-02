<template>
    <AppLayout>
  <main class="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Gestione interna</p>
        <h1 class="mt-2 text-3xl font-display text-zinc-900 sm:text-4xl">I tuoi appartamenti</h1>
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

        <div v-else-if="contrattoAttivo" class="w-full rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div class="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start">
            <!-- Sezione sinistra: dati appartamento e guasti -->
            <div class="flex-1">
              <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Contratto attuale</p>
                <h2 class="mt-2 text-2xl font-display text-zinc-900">
                  {{ indirizzoCompleto(contrattoAttivo?.idAppartamento) }}
                </h2>

                <div class="mt-4 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
                  <div class="rounded-2xl bg-white px-4 py-3">Stanze: <strong>{{ contrattoAttivo?.idAppartamento?.numStanze ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Bagni: <strong>{{ contrattoAttivo?.idAppartamento?.numBagni ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Canone mensile: <strong>€ {{ contrattoAttivo?.canoneMensile ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Stato: <strong>{{ capitalizeFirst(contrattoAttivo?.stato) }}</strong></div>
                </div>
              </div>

              <div v-if="successMessage" class="mt-4 rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                {{ successMessage }}
              </div>
            </div>

            <!-- Sezione destra: azioni rapide -->
            <div class="flex flex-col items-stretch justify-start gap-3 lg:w-56">
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="azionePlaceholder('calendario')"
              >
                Faccende
              </button>
                
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="azionePlaceholder('spesa')"
                >
                Lista spesa
              </button>
              
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="azionePlaceholder('consumi')"
              >
                Consumi
              </button>

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
          </div>

          <!-- Sezione bollette: lista e grafici consumi -->
          <div class="px-6 sm:px-8 mb-4">
            <div class="mt-2 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              <div class="mb-2 flex items-center justify-between gap-3 px-4">
                <p class="flex h-7 items-center text-xs font-semibold uppercase leading-none tracking-[0.2em] text-zinc-500">
                  Bollette
                </p>
                <button
                  type="button"
                  class="flex h-7 items-center text-xs font-semibold leading-none text-primary transition hover:text-primary-dark hover:underline"
                  @click="mostraBollette = !mostraBollette"
                >
                  {{ mostraBollette ? 'Nascondi' : 'Mostra' }}
                </button>
              </div>

              <transition name="fade">
                <div v-if="mostraBollette" class="px-1 pb-2">
                  <div v-if="bolletteLoading" class="py-4 text-center text-sm text-zinc-500">Caricamento bollette...</div>

                  <div v-else-if="!bollette.length" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
                    Nessuna bolletta disponibile per il tuo appartamento.
                  </div>

                  <template v-else>
                    <!-- Filtro per utenza -->
                    <div class="mb-3 flex flex-wrap gap-2 px-1">
                      <button
                        v-for="u in filtriUtenza"
                        :key="u.valore"
                        @click="filtroUtenzaAttivo = u.valore"
                        class="rounded-full px-3 py-1 text-xs font-semibold transition"
                        :class="filtroUtenzaAttivo === u.valore ? 'bg-[#9a1528] text-white' : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-100'"
                      >
                        {{ u.etichetta }}
                      </button>
                    </div>

                    <!-- Lista bollette filtrate -->
                    <ul class="mb-5 space-y-2">
                      <li
                        v-for="b in bolletteFiltrate"
                        :key="b._id"
                        class="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                      >
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="rounded-full px-2 py-0.5 text-xs font-semibold text-white" :class="coloreUtenzaInq(b.utenza)">
                              {{ capitalizeFirst(b.utenza) }}
                            </span>
                            <span class="font-semibold text-zinc-900">€ {{ Number(b.importo).toFixed(2) }}</span>
                            <span v-if="b.pagata" class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pagata</span>
                            <span v-else class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Da pagare</span>
                          </div>
                          <p class="mt-1 text-xs text-zinc-500">
                            {{ formatoDataBreve(b.periodoInizio) }} — {{ formatoDataBreve(b.periodoFine) }}
                          </p>
                        </div>
                        <a
                          v-if="b.pdfNomeFile"
                          :href="`/api/v1/bollette/${b._id}/pdf`"
                          target="_blank"
                          class="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          PDF
                        </a>
                      </li>
                    </ul>

                    <!-- Grafico consumi: importo per periodo -->
                    <div v-if="datiGraficoBollette.labels.length" class="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Andamento consumi</p>
                      <Bar :data="datiGraficoBollette" :options="opzioniGraficoBollette" />
                    </div>
                  </template>
                </div>
              </transition>
            </div>
          </div>

          <!-- Sezione segnalazioni estesa: occupa tutta la larghezza della card -->
          <div class="px-6 sm:px-8 mb-4">
            <div v-if="guastiAttivi.length" class="mt-2 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
            <div class="mb-2 flex items-center justify-between gap-3 px-4">
              <p class="flex h-7 items-center text-xs font-semibold uppercase leading-none tracking-[0.2em] text-zinc-500">
                Segnalazioni attive
              </p>
              <button
                type="button"
                class="flex h-7 items-center text-xs font-semibold leading-none text-primary transition hover:text-primary-dark hover:underline"
                @click="mostraGuasti = !mostraGuasti"
              >
                {{ mostraGuasti ? 'Nascondi' : 'Mostra' }}
              </button>
            </div>
            <transition name="fade">
              <ul v-if="mostraGuasti" class="space-y-3">
                <li v-for="g in guastiAttivi" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <!-- Sinistra: dati identificativi -->
                  <div class="flex-1">
                    <div>
                      <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                        {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                      </strong>
                      <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                    </div>
                    <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: <strong>{{ capitalizeFirst(g.stato) }}</strong></div>
                  </div>

                  <!-- Destra: date impilate e pulsante sotto -->
                  <div class="flex flex-col items-end gap-3 lg:min-w-[180px]">
                    <div class="text-xs text-zinc-500 text-right">
                      <div v-if="g.createdAt || g.dataSegnalazione">
                        <span class="font-semibold">Segnalato: {{ new Date(g.createdAt || g.dataSegnalazione).toLocaleDateString('it-IT') }}</span>
                        
                      </div>
                      <div v-if="g.dataPresoInCarico" class="mt-2">
                        <span class="font-semibold">Preso in carico: {{ new Date(g.dataPresoInCarico).toLocaleDateString('it-IT') }}</span>

                      </div>
                      <div v-if="g.dataSistemazione" class="mt-2">
                        <span class="font-semibold">Risolto: {{ new Date(g.dataSistemazione).toLocaleDateString('it-IT') }}</span>
                      </div>
                    </div>

                    <div>
                      <button
                        v-if="g.stato === 'preso in carico'"
                        @click="confermaRisoluzione(g)"
                        class="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        Guasto risolto
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </transition>
            </div>
          </div>
        </div>

        <div v-else class="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-600 shadow-sm">
          Non hai un contratto attivo al momento. Puoi consultare solo i contratti passati.
        </div>

        <div v-if="contrattiPassati.length" class="w-full">
          <div class="mb-4 text-center">
            <button
              type="button"
              class="text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
              @click="mostraPassati = !mostraPassati"
            >
              {{ mostraPassati ? 'Nascondi contratti passati' : 'Mostra contratti passati' }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="mostraPassati" class="grid gap-4">
              <article
                v-for="contratto in contrattiPassati"
                :key="contratto._id"
                class="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center"
              >
                <div class="flex-1">
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
                </div>
                <div class="flex flex-shrink-0 items-center lg:w-40">
                  <button
                    type="button"
                    class="flex w-full items-center justify-center rounded-full bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-300"
                  >
                    Lascia una recensione
                  </button>
                </div>
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
import { getContrattiUtenteLoggato, getGuastiAppartamento, risolviGuasto } from '../services/gestioneInternaService'
import { getBolletteInquilino } from '../services/bolletteService'
import GuastoForm from '@/components/GuastoForm.vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const contratti = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const mostraPassati = ref(false)
const mostraGuasti = ref(false)
const showGuastoForm = ref(false)
const guastiAttivi = ref([])
const successMessage = ref('')

const contrattoAttivo = computed(() => contratti.value.find((contratto) => contratto.stato === 'attivo') || null)
const contrattiPassati = computed(() => contratti.value.filter((contratto) => contratto.stato !== 'attivo'))
const appartamentoAttivo = computed(() => contrattoAttivo.value?.idAppartamento || null)

// ── Stato bollette inquilino ──────────────────────────────────────────────────
const bollette = ref([])
const bolletteLoading = ref(false)
const mostraBollette = ref(false)
const filtroUtenzaAttivo = ref('tutti')

const filtriUtenza = [
  { valore: 'tutti', etichetta: 'Tutte' },
  { valore: 'luce', etichetta: 'Luce' },
  { valore: 'gas', etichetta: 'Gas' },
  { valore: 'acqua', etichetta: 'Acqua' },
]

const graficiBollette = ref(null)

const bolletteFiltrate = computed(() => {
  if (filtroUtenzaAttivo.value === 'tutti') return bollette.value
  return bollette.value.filter((b) => b.utenza === filtroUtenzaAttivo.value)
})

const datiGraficoBollette = computed(() => {
  // Usa i dati grafici precalcolati dal backend, filtrati per utenza se necessario
  if (!graficiBollette.value) return { labels: [], datasets: [] }
  if (filtroUtenzaAttivo.value === 'tutti') return graficiBollette.value
  return {
    labels: graficiBollette.value.labels,
    datasets: graficiBollette.value.datasets.filter(
      (ds) => ds.label.toLowerCase() === filtroUtenzaAttivo.value
    ),
  }
})

const opzioniGraficoBollette = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: { label: (ctx) => ` € ${Number(ctx.raw).toFixed(2)}` },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => `€ ${v}` },
    },
  },
}

function coloreUtenzaInq(utenza) {
  const mappa = { luce: 'bg-amber-500', gas: 'bg-blue-500', acqua: 'bg-cyan-500' }
  return mappa[utenza] || 'bg-zinc-500'
}

function formatoDataBreve(dateValue) {
  if (!dateValue) return '—'
  return new Date(dateValue).toLocaleDateString('it-IT')
}

async function caricaBollette() {
  bolletteLoading.value = true
  const res = await getBolletteInquilino()
  if (res.success) {
    bollette.value = res.data?.data || []
    graficiBollette.value = res.data?.grafici || null
  }
  bolletteLoading.value = false
}

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

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function getPriorityColor(priorita) {
  const p = (priorita || 'media').toLowerCase()
  switch (p) {
    case 'scarsa':
      return 'text-yellow-700 font-semibold'
    case 'media':
      return 'text-orange-600 font-semibold'
    case 'urgente':
      return 'text-red-700 font-semibold'
    default:
      return 'text-zinc-900 font-semibold'
  }
}

function isRecentResolved(guasto) {
  if (guasto?.stato !== 'sistemato' || !guasto?.dataSistemazione) return false
  const resolvedAt = new Date(guasto.dataSistemazione)
  if (Number.isNaN(resolvedAt.getTime())) return false
  const now = new Date()
  const diffDays = (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function shouldShowGuasto(guasto) {
  if (!guasto) return false
  if (guasto.stato === 'segnalato' || guasto.stato === 'preso in carico') return true
  return isRecentResolved(guasto)
}

function filtraGuastiVisibili(lista) {
  return (Array.isArray(lista) ? lista : []).filter(shouldShowGuasto)
}

function vaiAGuasti() {
  if (!appartamentoAttivo.value) return
  showGuastoForm.value = true
}

function azionePlaceholder() {
  // azione temporanea: da collegare in seguito
}

function closeGuastoForm() {
  showGuastoForm.value = false
}

function onGuastoSaved(payload) {
  // payload may contain created guasto
  closeGuastoForm()
  successMessage.value = 'Segnalazione ricevuta — grazie, provvederemo a gestirla.'
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
    guastiAttivi.value = filtraGuastiVisibili(res.data?.data || [])
  }
}

async function confermaRisoluzione(guasto) {
  if (!guasto || !guasto._id) return

  try {
    const res = await risolviGuasto(guasto._id)
    if (res.success) {
      successMessage.value = 'Segnalazione marcata come risolta.'
      setTimeout(() => (successMessage.value = ''), 4000)
      await loadGuasti()
    } else {
      console.error('Errore risoluzione:', res.error)
    }
  } catch (err) {
    console.error(err)
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
    // se c'è un contratto attivo, carica guasti e bollette
    if (contratti.value && contratti.value.length) {
      const ca = contratti.value.find((c) => c.stato === 'attivo')
      if (ca) {
        await loadGuasti()
        await caricaBollette()
      }
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