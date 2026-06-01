<template>
  <AppLayout>
    <div class="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <!-- Intestazione sezione, simile al riferimento TAS -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">
            Gestione appartamenti
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            I tuoi appartamenti
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-zinc-500 sm:text-base">
            Controlla gli annunci, modifica i dettagli e aggiungi nuovi appartamenti dalla tua area riservata.
          </p>
        </div>

        <button
          @click="openCreate"
          class="inline-flex items-center justify-center rounded-full bg-[#9a1528] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7f1020]"
        >
          + Nuovo appartamento
        </button>
      </div>

      <!-- Griglia appartamenti -->
      <div v-if="loading" class="text-gray-600">Caricamento...</div>
      <div v-else-if="apartments.length === 0" class="text-gray-600">Nessun appartamento trovato. Clicca su "Nuovo appartamento" per aggiungerne uno!</div>
      <div v-else class="flex flex-col gap-6">
        <div v-for="apt in apartments" :key="apt._id" class="flex flex-col gap-3">
          <ApartmentCard
            :apt="apt"
            :show-annuncio-action="true"
            :show-guasti-action="true"
            guasti-action-label="Mostra segnalazioni"
            :guasti-count="getGuastiAttiviCount(apt)"
            @view="viewDetails(apt._id)"
            @edit="editApartment(apt)"
            @annuncio="openAnnuncio(apt)"
            @guasti="openGuastiModal(apt)"
          />
        </div>
      </div>
    </div>
  <!-- Modale Dettagli -->
  <ApartmentDetails v-if="showDetails" :apartmentId="selectedId" @close="closeDetails" @updated="reload" />

  <!-- Form creazione/modifica -->
  <ApartmentForm v-if="showForm" :initial="formInitial" @saved="onSaved" @close="closeForm" />

  <!-- Form annuncio -->
  <AnnuncioForm
    v-if="showAnnuncioForm && selectedApartmentForAnnuncio"
    :apartment="selectedApartmentForAnnuncio"
    :initial-annuncio="annuncioInitial"
    @saved="onAnnuncioSaved"
    @close="closeAnnuncio"
  />
  <!-- Modal risolvi guasto -->
  <div v-if="showResolveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeResolveModal">
    <div class="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Segnalazioni appartamento</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Conferma presa in carico</h3>
        </div>
        <button type="button" @click="closeResolveModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div class="px-6 py-5">
        <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p class="text-sm font-semibold text-zinc-900">Sei sicuro di voler prendere in carico questa segnalazione?</p>
          <p class="mt-2 text-sm leading-6 text-zinc-600">La segnalazione passerà nello stato <span class="font-semibold text-zinc-900">preso in carico</span> e verrà aggiornata la data di presa in carico.</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t border-zinc-200 px-6 py-5 sm:flex-row sm:justify-end">
        <button @click="closeResolveModal" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100">Chiudi</button>
        <button @click="confirmResolve" class="rounded-full px-5 py-2.5 font-semibold text-white transition hover:bg-[#7f1020]" style="background-color: #9a1528">Conferma</button>
      </div>
    </div>
  </div>

  <!-- Modale segnalazioni appartamento -->
  <div v-if="showGuastiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeGuastiModal">
    <div class="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Segnalazioni appartamento</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Guasti e manutenzioni</h3>
          <p class="mt-2 text-sm text-zinc-600">
            {{ selectedApartmentForGuasti ? (selectedApartmentForGuasti.indirizzo?.via || selectedApartmentForGuasti.titolo || selectedApartmentForGuasti._id) : '' }}
          </p>
        </div>
        <button type="button" @click="closeGuastiModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div class="max-h-[65vh] overflow-auto px-6 py-5 sm:px-8">
        <div v-if="guastiModalLoading" class="text-sm text-zinc-600">Caricamento segnalazioni in corso...</div>

        <template v-else>
          <div class="mb-4 flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Segnalazioni attive</p>
          </div>

          <div v-if="guastiAttiviModal.length === 0" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
            Nessuna segnalazione attiva per questo appartamento.
          </div>

          <ul v-else class="space-y-3">
            <li v-for="g in guastiAttiviModal" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              <!-- Sinistra: dati identificativi -->
              <div class="flex-1">
                <div>
                  <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                    {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                  </strong>
                  <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                </div>
                <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
              </div>

              <!-- Destra: date impilate e pulsante sotto -->
              <div class="flex flex-col items-end gap-3 lg:min-w-[180px]">
                <div class="text-xs text-zinc-500 text-right">
                  <div v-if="g.createdAt || g.dataSegnalazione">
                    <span class="font-semibold">Segnalato: {{ formatoData(g.dataSegnalazione || g.createdAt) }}</span>
                  </div>
                  <div v-if="g.dataPresoInCarico" class="mt-2">
                    <span class="font-semibold">Preso in carico: {{ formatoData(g.dataPresoInCarico) }}</span>
                  </div>
                  <div v-if="g.dataSistemazione" class="mt-2">
                    <span class="font-semibold">Risolto: {{ formatoData(g.dataSistemazione) }}</span>
                  </div>
                </div>
                <button
                  v-if="g.stato === 'segnalato'"
                  @click="openResolveModal(selectedApartmentForGuasti, g)"
                  class="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                >
                  Risolvi
                </button>
              </div>
            </li>
          </ul>

          <div class="mt-6 flex justify-center">
            <button
              type="button"
              class="text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
              @click="mostraStorico = !mostraStorico"
            >
              {{ mostraStorico ? 'Nascondi storico' : 'Visualizza storico' }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="mostraStorico" class="mt-6 border-t border-zinc-200 pt-5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Storico manutenzioni</p>
                <p class="text-xs text-zinc-500">Sistemate e archiviate</p>
              </div>

              <div v-if="guastiStoricoModal.length === 0" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
                Nessuna segnalazione storica disponibile.
              </div>

              <ul v-else class="space-y-3">
                <li v-for="g in guastiStoricoModal" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                  <!-- Sinistra: dati identificativi -->
                  <div class="flex-1">
                    <div>
                      <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                        {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                      </strong>
                      <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                    </div>
                    <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
                  </div>

                  <!-- Destra: date impilate -->
                  <div class="flex flex-col items-end text-xs text-zinc-500 text-right lg:min-w-[180px]">
                    <div v-if="g.createdAt || g.dataSegnalazione">
                      <span class="font-semibold">Segnalato: {{ formatoData(g.dataSegnalazione || g.createdAt) }}</span>
                    </div>
                    <div v-if="g.dataPresoInCarico" class="mt-2">
                      <span class="font-semibold">Preso in carico: {{ formatoData(g.dataPresoInCarico) }}</span>
                    </div>
                    <div v-if="g.dataSistemazione" class="mt-2">
                      <span class="font-semibold">Sistemato: {{ formatoData(g.dataSistemazione) }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
        </template>
      </div>

      <div class="border-t border-zinc-200 px-6 py-5 sm:px-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button @click="closeGuastiModal" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100">Chiudi</button>
        </div>
      </div>
    </div>
  </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import ApartmentDetails from '../components/ApartmentDetails.vue'
import ApartmentForm from '../components/ApartmentForm.vue'
import ApartmentCard from '../components/ApartmentCard.vue'
import AnnuncioForm from '../components/AnnuncioForm.vue'
import { getGuastiAppartamento, prendiInCaricoGuastoAdmin } from '../services/gestioneInternaService'

const apartments = ref([])
const loading = ref(false)
const showDetails = ref(false)
const showForm = ref(false)
const showAnnuncioForm = ref(false)
const selectedId = ref(null)
const formInitial = ref(null)
const selectedApartmentForAnnuncio = ref(null)

const showResolveModal = ref(false)
const resolveTargetGuasto = ref(null)
const resolveTargetApartment = ref(null)

const showGuastiModal = ref(false)
const selectedApartmentForGuasti = ref(null)
const guastiModalLoading = ref(false)
const guastiModalGuasti = ref([])
const mostraStorico = ref(false)
const guastiByApartment = ref({})

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

watch([showDetails, showForm, showAnnuncioForm, showGuastiModal], ([detailsOpen, formOpen, annuncioOpen, guastiOpen]) => {
  document.body.style.overflow = detailsOpen || formOpen || annuncioOpen || guastiOpen ? 'hidden' : ''
})

function getAuthHeaders() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

function getAppId(apt) {
  return apt?._id || apt?.id || ''
}

function formatoData(dateValue) {
  if (!dateValue) return '—'
  return new Date(dateValue).toLocaleDateString('it-IT')
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
  const diffDays = (Date.now() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function isActiveGuasto(guasto) {
  return guasto?.stato === 'segnalato' || guasto?.stato === 'preso in carico'
}

function isStoricoGuasto(guasto) {
  if (!guasto) return false
  if (guasto.stato === 'archiviato') return true
  if (guasto.stato === 'sistemato') return true
  return false
}

function isVisibleGuastoForAdmin(guasto) {
  return isActiveGuasto(guasto) || isStoricoGuasto(guasto)
}

const guastiAttiviModal = computed(() => guastiModalGuasti.value.filter(isActiveGuasto))
const guastiStoricoModal = computed(() => guastiModalGuasti.value.filter(isStoricoGuasto))

function getGuastiAttiviCount(apt) {
  const appId = getAppId(apt)
  if (!appId) return 0

  const cached = guastiByApartment.value[appId] || []
  return cached.filter(isActiveGuasto).length
}

async function loadApartments() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti/admin?page=1&limit=100`, {
      headers: getAuthHeaders(),
    })
    const body = await res.json()
    if (res.ok && body && body.data) {
      apartments.value = body.data
      await loadGuastiCounts(body.data)
    } else {
      apartments.value = []
      guastiByApartment.value = {}
    }
  } catch (err) {
    console.error(err)
    apartments.value = []
    guastiByApartment.value = {}
  } finally {
    loading.value = false
  }
}
async function loadAllApartments() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti?page=1&limit=10`, {
      headers: getAuthHeaders(),
    })
    const body = await res.json()
    if (res.ok && body && body.data) apartments.value = body.data
    else apartments.value = []
  } catch (err) {
    console.error(err)
    apartments.value = []
  } finally {
    loading.value = false
  }
}

async function loadGuastiCounts(apartmentsList) {
  if (!Array.isArray(apartmentsList) || apartmentsList.length === 0) {
    guastiByApartment.value = {}
    return
  }

  const entries = await Promise.all(
    apartmentsList.map(async (apt) => {
      const appId = getAppId(apt)
      if (!appId) return null

      try {
        const res = await getGuastiAppartamento(appId)
        const guasti = res.success ? (res.data?.data || []) : []
        return [appId, guasti]
      } catch (err) {
        console.error(err)
        return [appId, []]
      }
    }),
  )

  guastiByApartment.value = Object.fromEntries(entries.filter(Boolean))
}

async function loadGuastiModal(apt) {
  const appId = getAppId(apt)
  if (!appId || guastiModalLoading.value) return

  guastiModalLoading.value = true
  try {
    const res = await getGuastiAppartamento(appId)
    if (res.success) {
      const guasti = res.data?.data || []
      guastiModalGuasti.value = guasti
      guastiByApartment.value = {
        ...guastiByApartment.value,
        [appId]: guasti,
      }
    } else {
      console.error(res.error)
      guastiModalGuasti.value = []
    }
  } catch (err) {
    console.error(err)
    guastiModalGuasti.value = []
  } finally {
    guastiModalLoading.value = false
  }
}

async function openGuastiModal(apt) {
  selectedApartmentForGuasti.value = apt
  mostraStorico.value = false
  showGuastiModal.value = true
  await loadGuastiModal(apt)
}

function closeGuastiModal() {
  showGuastiModal.value = false
  selectedApartmentForGuasti.value = null
  guastiModalGuasti.value = []
  mostraStorico.value = false
}

function openResolveModal(apt, guasto) {
  resolveTargetApartment.value = apt
  resolveTargetGuasto.value = guasto
  showResolveModal.value = true
}

function closeResolveModal() {
  showResolveModal.value = false
  resolveTargetGuasto.value = null
  resolveTargetApartment.value = null
}

async function confirmResolve() {
  const guasto = resolveTargetGuasto.value
  const apt = resolveTargetApartment.value
  if (!guasto || !guasto._id) return closeResolveModal()

  try {
    const res = await prendiInCaricoGuastoAdmin(guasto._id)
    if (res.success) {
      await loadGuastiModal(apt)
    } else {
      console.error('Errore resolve:', res.error)
    }
  } catch (err) {
    console.error(err)
  } finally {
    closeResolveModal()
  }
}



function viewDetails(id) {
  selectedId.value = id
  showDetails.value = true
}

function closeDetails() {
  selectedId.value = null
  showDetails.value = false
}

function editApartment(apt) {
  formInitial.value = { ...apt }
  showForm.value = true
}

function openAnnuncio(apt) {
  selectedApartmentForAnnuncio.value = apt
  showAnnuncioForm.value = true
}

function closeAnnuncio() {
  selectedApartmentForAnnuncio.value = null
  showAnnuncioForm.value = false
}

function openCreate() {
  formInitial.value = null
  showForm.value = true
}

function closeForm() {
  formInitial.value = null
  showForm.value = false
}

function onSaved() {
  closeForm()
  loadApartments()
}

function onAnnuncioSaved(annuncio) {
  closeAnnuncio()
  loadApartments()
}

function reload() {
  closeDetails()
  loadApartments()
}

// Ascolta evento globale emesso dal componente dettagli per aprire il form
function onGlobalEdit(e) {
  const apt = e.detail
  if (apt) {
    formInitial.value = { ...apt }
    showForm.value = true
  }
}

onMounted(() => {
  // Carica solo gli appartamenti dell'admin loggato (filtrati per userId)
  loadApartments()
  window.addEventListener('admin:editApartment', onGlobalEdit)
})

onUnmounted(() => {
  window.removeEventListener('admin:editApartment', onGlobalEdit)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Layout interamente gestito con Tailwind. */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
