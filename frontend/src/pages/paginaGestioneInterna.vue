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

        <div v-else-if="contrattoAttivo && vistaAttiva === 'info'" class="w-full rounded-2xl border border-zinc-200 bg-white shadow-lg">
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
                @click="apriCalendarioCondiviso"
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

        <div v-else-if="contrattoAttivo && vistaAttiva === 'calendario'" class="w-full rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div class="flex flex-col gap-6 p-6 sm:p-8">
            <div class="flex flex-col gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Gestione interna</p>
                <h2 class="mt-2 text-2xl font-display text-zinc-900">Calendario condiviso</h2>
                <p class="mt-2 max-w-2xl text-sm text-zinc-600">
                  Turni delle faccende domestiche e giornate del servizio urbano dei rifiuti, visibili in un unico calendario.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="vistaAttiva = 'info'"
              >
                Torna ai dettagli contratto
              </button>
            </div>

            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Mese corrente</p>
                    <h3 class="mt-1 text-xl font-display text-zinc-900">{{ titoloCalendario }}</h3>
                  </div>

                  <div class="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span class="rounded-full bg-white px-3 py-2 shadow-sm">Turni faccende</span>
                    <span class="rounded-full bg-white px-3 py-2 shadow-sm">Rifiuti urbani</span>
                  </div>
                </div>

                <div class="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  <div v-for="giorno in giorniSettimana" :key="giorno" class="py-2">{{ giorno }}</div>
                </div>

                <div class="mt-2 grid grid-cols-7 gap-2">
                  <div
                    v-for="celle in celleCalendario"
                    :key="celle.key"
                    class="min-h-[128px] rounded-2xl border p-3 transition"
                    :class="celle.inMese
                      ? 'border-zinc-200 bg-white hover:border-primary/40'
                      : 'border-dashed border-zinc-200 bg-zinc-100 text-zinc-400'"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-sm font-semibold" :class="celle.oggi ? 'text-primary' : 'text-zinc-900'">
                        {{ celle.giorno }}
                      </span>
                      <span v-if="celle.oggi" class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Oggi</span>
                    </div>

                    <div class="mt-3 space-y-2">
                      <div
                        v-for="evento in celle.eventi"
                        :key="evento.label + celle.key"
                        class="overflow-hidden rounded-xl border text-xs transition"
                        :class="evento.tipo === 'faccende'
                          ? 'border-amber-200 bg-amber-50 text-amber-950'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-950'"
                      >
                        <button
                          type="button"
                          class="flex w-full items-center px-3 py-2 text-left font-semibold"
                          @click="toggleEvento(evento.key)"
                        >
                          <span>{{ evento.label }}</span>
                        </button>
                        <div v-if="eventoEspansoKey === evento.key" class="border-t px-3 py-2 text-[11px] font-medium leading-5 opacity-90">
                          {{ evento.dettaglio }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside class="space-y-4">
                <div class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Prossimi turni</p>
                  <div class="mt-4 space-y-3">
                    <article v-for="evento in eventiProssimi" :key="evento.key" class="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <button
                        type="button"
                        class="flex w-full items-center text-left"
                        @click="toggleEvento(evento.key)"
                      >
                        <div>
                          <p class="text-sm font-semibold text-zinc-900">{{ evento.label }}</p>
                        </div>
                      </button>
                      <div v-if="eventoEspansoKey === evento.key" class="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-zinc-600">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{{ formattaDataBreve(evento.data) }}</p>
                        {{ evento.dettaglio }}
                      </div>
                    </article>
                  </div>
                </div>

                <div class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Legenda</p>
                  <div class="mt-4 space-y-3 text-sm text-zinc-700">
                    <div class="flex items-center gap-3">
                      <span class="h-3 w-3 rounded-full bg-amber-400"></span>
                      <span>Turni delle faccende domestiche</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span>Passaggio del servizio urbano dei rifiuti</span>
                    </div>
                  </div>
                </div>
              </aside>
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
import GuastoForm from '@/components/GuastoForm.vue'

const contratti = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const mostraPassati = ref(false)
const mostraGuasti = ref(false)
const showGuastoForm = ref(false)
const guastiAttivi = ref([])
const successMessage = ref('')
const vistaAttiva = ref('info')
const eventoEspansoKey = ref('')

const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const dataCalendario = new Date()
const meseCorrente = dataCalendario.getMonth()
const annoCorrente = dataCalendario.getFullYear()
const dataOggiISO = oggiISO()

const templateTurni = {
  1: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Bagni e cucina' },
  2: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Organico' },
  3: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Soggiorno e superfici' },
  4: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Carta e cartone' },
  5: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Cucina e pavimenti' },
  6: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Plastica e vetro' },
}

const titoloCalendario = computed(() =>
  new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(annoCorrente, meseCorrente, 1)),
)

const celleCalendario = computed(() => {
  const primoGiorno = new Date(annoCorrente, meseCorrente, 1)
  const ultimoGiorno = new Date(annoCorrente, meseCorrente + 1, 0)
  const offset = (primoGiorno.getDay() + 6) % 7
  const giorniNelMese = ultimoGiorno.getDate()
  const totaleCelle = Math.ceil((offset + giorniNelMese) / 7) * 7

  return Array.from({ length: totaleCelle }, (_, index) => {
    const giornoDelMese = index - offset + 1
    const inMese = giornoDelMese >= 1 && giornoDelMese <= giorniNelMese
    const data = inMese ? new Date(annoCorrente, meseCorrente, giornoDelMese) : null
    const giornoSettimana = data ? data.getDay() : null
    const template = giornoSettimana !== null ? templateTurni[giornoSettimana] : null

    return {
      key: `${annoCorrente}-${meseCorrente}-${index}`,
      giorno: inMese ? giornoDelMese : '',
      inMese,
      oggi: inMese && data.toISOString().slice(0, 10) === dataOggiISO,
      eventi: template ? [{ ...template, data: data.toISOString() }] : [],
    }
  })
})

const eventiProssimi = computed(() => {
  const eventi = []
  const oggi = new Date()

  for (let i = 0; i < 14; i += 1) {
    const data = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + i)
    const template = templateTurni[data.getDay()]

    if (template) {
      eventi.push({
        key: `${data.toISOString()}-${template.label}`,
        data: data.toISOString(),
        ...template,
      })
    }
  }

  return eventi.slice(0, 5)
})

const contrattoAttivo = computed(() => contratti.value.find((contratto) => contratto.stato === 'attivo') || null)
const contrattiPassati = computed(() => contratti.value.filter((contratto) => contratto.stato !== 'attivo'))
const appartamentoAttivo = computed(() => contrattoAttivo.value?.idAppartamento || null)

function oggiISO() {
  return new Date().toISOString().slice(0, 10)
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

function apriCalendarioCondiviso() {
  vistaAttiva.value = 'calendario'
}

function toggleEvento(key) {
  eventoEspansoKey.value = eventoEspansoKey.value === key ? '' : key
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

function formattaDataBreve(data) {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(data))
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

watch(contrattoAttivo, (value) => {
  if (!value) showGuastoForm.value = false
  // quando cambia il contratto attivo, carica i guasti relativi
  if (value) loadGuasti()
})

watch(vistaAttiva, (value) => {
  if (value === 'calendario') {
    mostraGuasti.value = false
  }
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