<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528]">Appartamento</p>
          <h2 class="mt-1 text-2xl font-bold text-zinc-900">{{ isEdit ? 'Modifica appartamento' : 'Nuovo appartamento' }}</h2>
        </div>
        <button type="button" @click="$emit('close')" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Città</label>
            <input v-model="form.indirizzo.citta" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Via</label>
            <input v-model="form.indirizzo.via" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">MQ Totali</label>
            <input type="number" v-model.number="form.mqTot" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Stanze</label>
            <input type="number" v-model.number="form.numStanze" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Bagni</label>
            <input type="number" v-model.number="form.numBagni" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
        </div>

        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="form.perStudenti" class="h-4 w-4 rounded" />
            <span class="text-sm font-medium text-gray-700">Per studenti</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="form.terrazzo" class="h-4 w-4 rounded" />
            <span class="text-sm font-medium text-gray-700">Terrazzo</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="form.lavatrice" class="h-4 w-4 rounded" />
            <span class="text-sm font-medium text-gray-700">Lavatrice</span>
          </label>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">Classe energetica</label>
          <select v-model="form.classeEnergetica" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none">
            <option value="">Seleziona una classe</option>
            <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <button type="button" @click="$emit('close')" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">Annulla</button>
          <button type="submit" class="rounded-full px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]" style="background-color: #9a1528">Salva</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Form per creare o modificare un appartamento.
// Props: initial (oggetto o null)
// Emissioni: saved, close

import { reactive, watch, computed } from 'vue'

const props = defineProps({ initial: { type: Object, default: null } })
const emits = defineEmits(['saved', 'close'])

const classes = ['A4','A3','A2','A1','B','C','D','E','F','G']

const defaultForm = () => ({
  indirizzo: { citta: '', via: '' },
  mqTot: null,
  perStudenti: false,
  numStanze: null,
  numBagni: null,
  foto: [],
  terrazzo: false,
  lavatrice: false,
  classeEnergetica: '',
  amministratoreId: localStorage.getItem('userId') || '',
})

const form = reactive(defaultForm())

const isEdit = computed(() => !!props.initial)

watch(() => props.initial, (v) => {
  if (v) {
    // Popola il form con i dati per l'editing
    Object.assign(form, {
      indirizzo: { ...(v.indirizzo || {}) },
      mqTot: v.mqTot,
      perStudenti: !!v.perStudenti,
      numStanze: v.numStanze,
      numBagni: v.numBagni,
      foto: v.foto || [],
      terrazzo: !!v.terrazzo,
      lavatrice: !!v.lavatrice,
      classeEnergetica: v.classeEnergetica || '',
      amministratoreId: v.amministratoreId || localStorage.getItem('userId') || '',
    })
  } else {
    Object.assign(form, defaultForm())
  }
}, { immediate: true })

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function onSubmit() {
  try {
    if (isEdit.value && props.initial && props.initial._id) {
      const res = await fetch(`${API_BASE}/appartamenti/${props.initial._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      })
      const body = await res.json()
      if (res.ok) emits('saved', body.data)
      else alert(body?.message || 'Errore aggiornamento')
    } else {
      const res = await fetch(`${API_BASE}/appartamenti`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      })
      const body = await res.json()
      if (res.status === 201 || res.ok) emits('saved', body.data)
      else alert(body?.message || 'Errore creazione')
    }
  } catch (err) {
    console.error(err)
    alert('Errore di rete')
  }
}
</script>

<style scoped>
/* Styling minimo: Tailwind gestisce la maggior parte */
</style>
