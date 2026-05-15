<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528]">Scheda appartamento</p>
          <h2 class="mt-1 text-2xl font-bold text-zinc-900">Dettagli appartamento</h2>
        </div>
        <button type="button" @click="$emit('close')" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-gray-600">Caricamento...</div>

      <div v-else>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Città</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.indirizzo?.citta || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Via</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.indirizzo?.via || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">MQ totali</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.mqTot || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Stanze</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.numStanze || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Bagni</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.numBagni || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Classe energetica</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.classeEnergetica || '-' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Per studenti</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.perStudenti ? 'Sì' : 'No' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Terrazzo</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.terrazzo ? 'Sì' : 'No' }}</span></div>
          <div class="rounded-2xl bg-zinc-50 p-4"><span class="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Lavatrice</span><span class="mt-1 block text-sm font-semibold text-zinc-900">{{ apt.lavatrice ? 'Sì' : 'No' }}</span></div>
        </div>

        <div class="mt-6 flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <button @click="$emit('close')" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">Chiudi</button>
          <button @click="onEdit" class="rounded-full px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]" style="background-color: #9a1528">Modifica</button>
          <button @click="onDelete" class="rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700">Elimina</button>
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

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

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
