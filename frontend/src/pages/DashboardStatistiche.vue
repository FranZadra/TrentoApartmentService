<template>
  <AppLayout>
    <main class="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <section class="mx-auto flex w-full max-w-6xl flex-col gap-8">

        <!-- Intestazione pagina -->
        <header class="text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Comune di Trento</p>
          <h1 class="mt-2 font-display text-3xl text-zinc-900 sm:text-4xl">TAS Data</h1>
          <p class="mt-2 text-sm text-zinc-500">
            Dati statistici aggregati e anonimizzati sul mercato degli affitti a Trento.
          </p>
        </header>

        <!-- Filtri -->
        <div class="flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">CAP</label>
            <select
              v-model="filtri.cap"
              class="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tutti</option>
              <option v-for="zona in capDisponibili" :key="zona" :value="zona">{{ zona }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Tipo camera</label>
            <select
              v-model="filtri.tipoCamera"
              class="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tutti</option>
              <option value="SINGOLA">Singola</option>
              <option value="DOPPIA">Doppia</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Per studenti</label>
            <select
              v-model="filtri.perStudenti"
              class="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tutti</option>
              <option value="true">Sì</option>
              <option value="false">No</option>
            </select>
          </div>

          <button
            @click="applicaFiltri"
            class="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Applica filtri
          </button>
        </div>

        <!-- Stato di caricamento -->
        <div
          v-if="isLoading"
          class="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm"
        >
          Caricamento statistiche in corso...
        </div>

        <!-- Stato di errore -->
        <div
          v-else-if="errorMessage"
          class="w-full rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm"
        >
          {{ errorMessage }}
        </div>

        <!-- Dati caricati -->
        <template v-else-if="statistiche">

          <!-- Card con statistiche -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Appartamenti</p>
              <p class="text-3xl font-bold text-zinc-900">{{ statistiche.totaleAppartamenti }}</p>
              <p class="text-xs text-zinc-500">totale registrati</p>
            </div>

            <div class="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Contratti attivi</p>
              <p class="text-3xl font-bold text-primary">{{ statistiche.contratti.attivi }}</p>
              <p class="text-xs text-zinc-500">in chiusura: {{ statistiche.contratti.inChiusura }}</p>
            </div>

            <div class="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Tasso occupazione</p>
              <p class="text-3xl font-bold text-zinc-900">{{ formatPercentuale(statistiche.tassoOccupazione) }}</p>
              <p class="text-xs text-zinc-500">camere occupate sul totale</p>
            </div>

            <div class="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Prezzo medio €/m²</p>
              <p class="text-3xl font-bold text-zinc-900">{{ formatEuro(statistiche.prezzoMedioGlobalePerMq) }}</p>
              <p class="text-xs text-zinc-500">canone / m² appartamento</p>
            </div>
          </div>

          <!-- Grafici -->
          <div class="grid gap-6 lg:grid-cols-2">

            <!-- Grafico a barre: prezzo medio per CAP -->
            <div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Prezzo medio €/m² per CAP
              </p>
              <div v-if="statistiche.distribuzionePerCAP.length">
                <Bar :data="chartDataCAP" :options="opzioniGrafico" />
              </div>
              <p v-else class="text-sm text-zinc-400">Nessun dato disponibile.</p>
            </div>

            <!-- Grafico a ciambella: distribuzione tipo camera -->
            <div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Distribuzione tipo camera
              </p>
              <div v-if="statistiche.distribuzionePerTipo.length" class="mx-auto max-w-xs">
                <Doughnut :data="chartDataTipo" :options="opzioniCiambella" />
              </div>
              <p v-else class="text-sm text-zinc-400">Nessun dato disponibile.</p>
            </div>
          </div>

          <!-- Riga inferiore: turnover + distribuzione per CAP dettaglio -->
          <div class="grid gap-6 lg:grid-cols-3">

            <!-- Turnover -->
            <div class="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Turnover ultimo anno</p>
              <p class="text-4xl font-bold text-zinc-900">{{ statistiche.turnoverUltimoAnno }}</p>
              <p class="text-xs text-zinc-500">contratti terminati negli ultimi 12 mesi</p>
            </div>

            <!-- Tabella riepilogo per CAP -->
            <div class="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Dettaglio per CAP
              </p>
              <div v-if="statistiche.distribuzionePerCAP.length" class="overflow-x-auto">
                <table class="w-full text-sm text-zinc-700">
                  <thead>
                    <tr class="border-b border-zinc-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                      <th class="pb-2 pr-4">CAP</th>
                      <th class="pb-2 pr-4">Appartamenti</th>
                      <th class="pb-2">€/m² medio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="zona in statistiche.distribuzionePerCAP"
                      :key="zona.cap"
                      class="border-b border-zinc-50 last:border-0"
                    >
                      <td class="py-2 pr-4 font-semibold">{{ zona.cap }}</td>
                      <td class="py-2 pr-4">{{ zona.numAppartamenti }}</td>
                      <td class="py-2">{{ zona.prezzoMedioMq != null ? formatEuro(zona.prezzoMedioMq) : '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-sm text-zinc-400">Nessun dato disponibile.</p>
            </div>
          </div>

        </template>

      </section>
    </main>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { getStatistiche } from '@/services/statisticheService'

// Registrazione componenti necessari
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const router = useRouter()
const auth = useAuthStore()

const statistiche = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

// Filtri selezionati dall'utente
const filtri = ref({ cap: '', tipoCamera: '', perStudenti: '' })

// Lista dei CAP disponibili
const capDisponibili = computed(() => statistiche.value?.capDisponibili ?? [])

// Funzioni di formattazione dei valori numerici
function formatPercentuale(valore) {
  if (valore == null) return '—'
  return `${(valore * 100).toFixed(1)}%`
}

function formatEuro(valore) {
  if (valore == null) return '—'
  return `€ ${Number(valore).toFixed(2)}`
}

// Dati grafici

const chartDataCAP = computed(() => {
  const zone = statistiche.value?.distribuzionePerCAP ?? []
  return {
    labels: zone.map((z) => z.cap),
    datasets: [
      {
        label: '€/m² medio',
        data: zone.map((z) => z.prezzoMedioMq),
        backgroundColor: 'rgba(154, 21, 40, 0.75)',
        borderColor: '#9a1528',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }
})

const chartDataTipo = computed(() => {
  const tipi = statistiche.value?.distribuzionePerTipo ?? []
  return {
    labels: tipi.map((t) => t.tipo),
    datasets: [
      {
        data: tipi.map((t) => t.count),
        backgroundColor: ['#9a1528', '#d4a0a9'],
        borderWidth: 0,
      },
    ],
  }
})

const opzioniGrafico = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` € ${Number(ctx.raw).toFixed(2)} / m²`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => `€ ${v}` },
    },
  },
}

const opzioniCiambella = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
  },
}

// Caricamento dati
async function caricaStatistiche() {
  isLoading.value = true
  errorMessage.value = ''

  // Costruisce i parametri escludendo i valori vuoti
  const params = {}
  if (filtri.value.cap) params.cap = filtri.value.cap
  if (filtri.value.tipoCamera) params.tipoCamera = filtri.value.tipoCamera
  if (filtri.value.perStudenti !== '') params.perStudenti = filtri.value.perStudenti

  const response = await getStatistiche(params)

  if (response.success) {
    statistiche.value = response.data.data
  } else {
    errorMessage.value = response.error
  }

  isLoading.value = false
}

function applicaFiltri() {
  caricaStatistiche()
}

onMounted(async () => {
  // Reindirizza chiunque non sia un dipendente comunale
  if (auth.user?.ruolo !== 'dipendente comune') {
    router.push({ name: 'home' })
    return
  }
  await caricaStatistiche()
})
</script>
