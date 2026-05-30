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
            :guasti-action-label="guastiOpenByApartment[getAppId(apt)] ? 'Nascondi segnalazioni' : 'Mostra segnalazioni'"
            @view="viewDetails(apt._id)"
            @edit="editApartment(apt)"
            @annuncio="openAnnuncio(apt)"
            @guasti="toggleGuasti(apt)"
          />

          <transition name="fade">
            <div v-if="guastiOpenByApartment[getAppId(apt)]" class="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Segnalazioni appartamento
                </p>
              </div>

              <div v-if="guastiLoadingByApartment[getAppId(apt)]" class="text-sm text-zinc-600">
                Caricamento segnalazioni in corso...
              </div>

              <div v-else-if="(guastiByApartment[getAppId(apt)] || []).length === 0" class="text-sm text-zinc-600">
                Nessuna segnalazione presente per questo appartamento.
              </div>

              <ul v-else class="space-y-3">
                <li v-for="g in guastiByApartment[getAppId(apt)]" :key="g._id" class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                        {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                      </strong>
                      <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                      <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                      <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
                    </div>

                    <div class="flex flex-col items-end gap-2">
                      <span class="text-xs text-zinc-500">{{ formatoData(g.createdAt || g.dataSegnalazione) }}</span>
                      <button
                        v-if="g.stato === 'segnalato'"
                        @click="openResolveModal(apt, g)"
                        class="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                      >
                        Risolvi
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
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
  <div v-if="showResolveModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="closeResolveModal"></div>
    <div class="relative z-10 max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-zinc-900">Conferma presa in carico</h3>
      <p class="mt-3 text-sm text-zinc-700">Sei sicuro di voler prendere in carico questa segnalazione e contattare un tecnico per la manutenzione?</p>
      <div class="mt-5 flex justify-end gap-3">
        <button @click="closeResolveModal" class="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700">Annulla</button>
        <button @click="confirmResolve" class="rounded-full bg-[#9a1528] px-4 py-2 text-sm font-semibold text-white">Conferma</button>
      </div>
    </div>
  </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import ApartmentDetails from '../components/ApartmentDetails.vue'
import ApartmentForm from '../components/ApartmentForm.vue'
import ApartmentCard from '../components/ApartmentCard.vue'
import AnnuncioForm from '../components/AnnuncioForm.vue'
import { getGuastiAppartamentoAdmin, prendiInCaricoGuastoAdmin } from '../services/gestioneInternaService'

const apartments = ref([])
const loading = ref(false)
const showDetails = ref(false)
const showForm = ref(false)
const showAnnuncioForm = ref(false)
const selectedId = ref(null)
const formInitial = ref(null)
const selectedApartmentForAnnuncio = ref(null)
const guastiOpenByApartment = reactive({})
const guastiLoadingByApartment = reactive({})
const guastiByApartment = reactive({})

const showResolveModal = ref(false)
const resolveTargetGuasto = ref(null)
const resolveTargetApartment = ref(null)

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

watch([showDetails, showForm, showAnnuncioForm], ([detailsOpen, formOpen, annuncioOpen]) => {
  document.body.style.overflow = detailsOpen || formOpen || annuncioOpen ? 'hidden' : ''
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

async function loadApartments() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti/admin?page=1&limit=100`, {
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

async function loadGuastiAppartamento(apt) {
  const appId = getAppId(apt)
  if (!appId || guastiLoadingByApartment[appId]) return

  guastiLoadingByApartment[appId] = true
  try {
    const res = await getGuastiAppartamentoAdmin(appId)
    if (res.success) {
      guastiByApartment[appId] = res.data?.data || []
    } else {
      guastiByApartment[appId] = []
      console.error(res.error)
    }
  } catch (err) {
    console.error(err)
    guastiByApartment[appId] = []
  } finally {
    guastiLoadingByApartment[appId] = false
  }
}

async function toggleGuasti(apt) {
  const appId = getAppId(apt)
  if (!appId) return

  guastiOpenByApartment[appId] = !guastiOpenByApartment[appId]
  if (guastiOpenByApartment[appId] && !guastiByApartment[appId]) {
    await loadGuastiAppartamento(apt)
  }
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
      await loadGuastiAppartamento(apt)
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
