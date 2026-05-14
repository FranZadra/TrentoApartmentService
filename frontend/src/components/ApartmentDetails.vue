<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
      <h2 class="text-xl font-semibold mb-4">Dettagli Appartamento</h2>

      <div v-if="loading" class="text-gray-600">Caricamento...</div>

      <div v-else>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><strong>Città:</strong> {{ apt.indirizzo?.citta || '-' }}</div>
          <div><strong>Via:</strong> {{ apt.indirizzo?.via || '-' }}</div>
          <div><strong>MQ Totali:</strong> {{ apt.mqTot || '-' }}</div>
          <div><strong>Stanze:</strong> {{ apt.numStanze || '-' }}</div>
          <div><strong>Bagni:</strong> {{ apt.numBagni || '-' }}</div>
          <div><strong>Classe Energetica:</strong> {{ apt.classeEnergetica || '-' }}</div>
          <div><strong>Per studenti:</strong> {{ apt.perStudenti ? 'Sì' : 'No' }}</div>
          <div><strong>Terrazzo:</strong> {{ apt.terrazzo ? 'Sì' : 'No' }}</div>
          <div><strong>Lavatrice:</strong> {{ apt.lavatrice ? 'Sì' : 'No' }}</div>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="$emit('close')" class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Chiudi</button>
          <button @click="onEdit" class="px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200">Modifica</button>
          <button @click="onDelete" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Elimina</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente che mostra i dettagli di un appartamento.
// Props: apartmentId (string)
// Emissioni: close, updated

import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  apartmentId: { type: String, required: true },
})
const emits = defineEmits(['close', 'updated'])

const apt = ref(null)
const loading = ref(false)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function getAuthHeaders() {
  const token = localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function load() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti/${props.apartmentId}`, { headers: getAuthHeaders() })
    const body = await res.json()
    if (res.ok && body && body.data) apt.value = body.data
    else apt.value = null
  } catch (err) {
    console.error(err)
    apt.value = null
  } finally {
    loading.value = false
  }
}

async function onDelete() {
  if (!confirm('Sei sicuro di voler eliminare questo appartamento?')) return
  try {
    const res = await fetch(`${API_BASE}/appartamenti/${props.apartmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const body = await res.json()
    if (res.ok) {
      emits('updated')
    } else {
      alert(body?.message || 'Errore eliminazione')
    }
  } catch (err) {
    console.error(err)
    alert('Errore di rete')
  }
}

function onEdit() {
  // Emetti evento globale per chiedere al parent di aprire il form con i dati
  emits('close')
  window.dispatchEvent(new CustomEvent('admin:editApartment', { detail: apt.value }))
}

watch(() => props.apartmentId, () => {
  if (props.apartmentId) load()
})

onMounted(() => {
  if (props.apartmentId) load()
})
</script>

<style scoped>
/* Usa Tailwind per layout */
</style>
