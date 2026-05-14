<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
      <h2 class="text-xl font-semibold mb-4">{{ isEdit ? 'Modifica Appartamento' : 'Nuovo Appartamento' }}</h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Città</label>
            <input v-model="form.indirizzo.citta" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm font-medium">Via</label>
            <input v-model="form.indirizzo.via" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium">MQ Totali</label>
            <input type="number" v-model.number="form.mqTot" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm font-medium">Stanze</label>
            <input type="number" v-model.number="form.numStanze" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label class="block text-sm font-medium">Bagni</label>
            <input type="number" v-model.number="form.numBagni" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>
        </div>

        <div class="flex gap-4">
          <label class="inline-flex items-center"><input type="checkbox" v-model="form.perStudenti" class="mr-2" />Per studenti</label>
          <label class="inline-flex items-center"><input type="checkbox" v-model="form.terrazzo" class="mr-2" />Terrazzo</label>
          <label class="inline-flex items-center"><input type="checkbox" v-model="form.lavatrice" class="mr-2" />Lavatrice</label>
        </div>

        <div>
          <label class="block text-sm font-medium">Classe energetica</label>
          <select v-model="form.classeEnergetica" class="mt-1 block w-48 border rounded px-2 py-1">
            <option value="">—</option>
            <option v-for="c in classes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Annulla</button>
          <button type="submit" class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Salva</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Form per creare o modificare un appartamento.
// Props: initial (oggetto o null)
// Emissioni: saved, close

import { reactive, toRefs, watch, computed } from 'vue'

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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

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
