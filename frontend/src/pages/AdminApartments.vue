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
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ApartmentCard
          v-for="apt in apartments"
          :key="apt._id"
          :apartment="apt"
          @view-details="viewDetails(apt._id)"
        />
      </div>
    </div>
  <!-- Modale Dettagli -->
  <ApartmentDetails v-if="showDetails" :apartmentId="selectedId" @close="closeDetails" @updated="reload" />

  <!-- Form creazione/modifica -->
  <ApartmentForm v-if="showForm" :initial="formInitial" @saved="onSaved" @close="closeForm" />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import ApartmentDetails from '../components/ApartmentDetails.vue'
import ApartmentForm from '../components/ApartmentForm.vue'
import ApartmentCard from '../components/ApartmentCard.vue'

const apartments = ref([])
const loading = ref(false)
const showDetails = ref(false)
const showForm = ref(false)
const selectedId = ref(null)
const formInitial = ref(null)

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

watch([showDetails, showForm], ([detailsOpen, formOpen]) => {
  document.body.style.overflow = detailsOpen || formOpen ? 'hidden' : ''
})

function getAuthHeaders() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

// Estrae l'ID amministratore dal payload del token JWT salvato in localStorage.
// Il payload JWT è la seconda parte del token (base64url), che contiene { id, iat, exp }.
function getIdDalToken() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id || payload._id || null
  } catch {
    return null
  }
}

async function loadApartments() {
  loading.value = true
  try {
    const amministratoreId = getIdDalToken()
    if (!amministratoreId) {
      apartments.value = []
      loading.value = false
      return
    }

    const res = await fetch(`${API_BASE}/appartamenti/admin/${amministratoreId}?page=1&limit=100`, {
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
</style>
