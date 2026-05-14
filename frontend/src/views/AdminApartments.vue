<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Gestione Appartamenti (Admin)</h1>
      <div>
        <button @click="openCreate" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nuovo Appartamento</button>
      </div>
    </div>

    <!-- Lista appartamenti dell'amministratore -->
    <div v-if="loading" class="text-gray-600">Caricamento...</div>
    <div v-else>
      <div v-if="apartments.length === 0" class="text-gray-600">Nessun appartamento trovato.</div>
      <ul class="space-y-4">
        <li v-for="apt in apartments" :key="apt._id" class="p-4 border rounded shadow-sm flex justify-between items-start">
          <div>
            <div class="text-lg font-medium">{{ apt.indirizzo?.citta || 'Indirizzo non disponibile' }} — {{ apt.indirizzo?.via || '' }}</div>
            <div class="text-sm text-gray-600">MQ: {{ apt.mqTot }} · Stanze: {{ apt.numStanze }} · Bagni: {{ apt.numBagni }}</div>
          </div>

          <div class="flex gap-2">
            <button @click="viewDetails(apt._id)" class="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Dettagli</button>
            <button @click="editApartment(apt)" class="px-3 py-1 bg-yellow-100 rounded hover:bg-yellow-200">Modifica</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modale Dettagli -->
    <ApartmentDetails v-if="showDetails" :apartmentId="selectedId" @close="closeDetails" @updated="reload" />

    <!-- Form creazione/modifica -->
    <ApartmentForm v-if="showForm" :initial="formInitial" @saved="onSaved" @close="closeForm" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ApartmentDetails from '../components/ApartmentDetails.vue'
import ApartmentForm from '../components/ApartmentForm.vue'

const apartments = ref([])
const loading = ref(false)
const showDetails = ref(false)
const showForm = ref(false)
const selectedId = ref(null)
const formInitial = ref(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function getAuthHeaders() {
  const token = localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function loadApartments() {
  loading.value = true
  try {
    const amministratoreId = localStorage.getItem('userId')
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
  loadApartments()
  window.addEventListener('admin:editApartment', onGlobalEdit)
})

onUnmounted(() => {
  window.removeEventListener('admin:editApartment', onGlobalEdit)
})
</script>

<style scoped>
/* Layout minimale: usiamo Tailwind per styling */
</style>
