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
            <div class="mb-2 flex items-center justify-between gap-3">
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
              <ul v-if="mostraGuasti" class="space-y-2">
                <li v-for="g in guastiAttivi" :key="g._id" class="flex items-start gap-3">
                  <div class="flex-1">
                    <div class="flex items-baseline justify-between gap-3">
                      <span>
                        <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                          {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                        </strong>
                        <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                      </span>
                      <span class="text-xs text-zinc-500">{{ new Date(g.createdAt || g.dataSegnalazione).toLocaleDateString('it-IT') }}</span>
                    </div>
                    <p class="mt-1 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-1 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
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
import { getContrattiUtenteLoggato, getGuastiAppartamento } from '../services/gestioneInternaService'
import GuastoForm from '@/components/GuastoForm.vue'

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