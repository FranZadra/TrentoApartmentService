<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
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

      <!-- Errori di validazione restituiti dal backend -->
      <div v-if="erroriValidazione.length > 0" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p class="mb-2 text-sm font-semibold text-red-700">Correggi i seguenti errori:</p>
        <ul class="list-inside list-disc space-y-1">
          <li v-for="(err, i) in erroriValidazione" :key="i" class="text-sm text-red-600">{{ err }}</li>
        </ul>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Indirizzo -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Città</label>
            <input v-model="form.indirizzo.città" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Via</label>
            <input v-model="form.indirizzo.via" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Numero civico</label>
            <input type="number" v-model.number="form.indirizzo.numero" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">CAP</label>
            <input v-model="form.indirizzo.CAP" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
        </div>

        <!-- Caratteristiche metri quadrati, numero stanze/bagni -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">MQ Totali</label>
            <input type="number" v-model.number="form.mqTot" min="0" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Stanze</label>
            <input type="number" v-model.number="form.numStanze" min="0" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Bagni</label>
            <input type="number" v-model.number="form.numBagni" min="0" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none" />
          </div>
        </div>

        <!-- Checkbox -->
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

        <!-- Classe energetica -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">Classe energetica</label>
          <select v-model="form.classeEnergetica" class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none">
            <option value="">Seleziona una classe</option>
            <option v-for="c in classi" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- Foto: lista di URL inseribili manualmente -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">Foto (URL)</label>
          <div v-for="(_, i) in form.foto" :key="i" class="mb-2 flex gap-2">
            <input
              v-model="form.foto[i]"
              type="url"
              placeholder="https://..."
              class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-[#9a1528] focus:outline-none"
            />
            <button
              type="button"
              @click="rimuoviFoto(i)"
              class="rounded border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Rimuovi
            </button>
          </div>
          <button
            type="button"
            @click="aggiungiFoto"
            class="mt-1 rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            + Aggiungi foto
          </button>
        </div>

        <!-- Pulsanti azione -->
        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <button type="button" @click="$emit('close')" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">
            Annulla
          </button>
          <button type="submit" class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
            Salva
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Form per creare o modificare un appartamento.

import { reactive, ref, watch, computed } from 'vue'

const props = defineProps({ initial: { type: Object, default: null } })
const emits = defineEmits(['saved', 'close'])

const classi = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G']

// Errori di validazione restituiti dal backend
const erroriValidazione = ref([])

// Struttura iniziale del form
const defaultForm = () => ({
  indirizzo: { città: '', via: '', numero: null, CAP: '', Stato: 'Italia' },
  mqTot: null,
  perStudenti: false,
  numStanze: null,
  numBagni: null,
  foto: [],
  terrazzo: false,
  lavatrice: false,
  classeEnergetica: '',
  amministratoreId: getIdDalToken() || '',
})

const form = reactive(defaultForm())

const isEdit = computed(() => !!props.initial)

// Quando viene passato un appartamento esistente, popola il form con i suoi dati
watch(() => props.initial, (v) => {
  erroriValidazione.value = []
  if (v) {
    Object.assign(form, {
      indirizzo: { ...(v.indirizzo || {}) },
      mqTot: v.mqTot,
      perStudenti: !!v.perStudenti,
      numStanze: v.numStanze,
      numBagni: v.numBagni,
      foto: v.foto ? [...v.foto] : [],
      terrazzo: !!v.terrazzo,
      lavatrice: !!v.lavatrice,
      classeEnergetica: v.classeEnergetica || '',
      amministratoreId: v.amministratoreId || getIdDalToken() || '',
    })
  } else {
    Object.assign(form, defaultForm())
  }
}, { immediate: true })

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v2` || '/api/v2'

function getAuthHeaders() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token') || ''
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

// Estrae l'ID amministratore dal payload del token JWT.
function getIdDalToken() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token')
  if (!token) return ''
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id || payload._id || payload.sub
  } catch (err) {
    console.error('Errore durante la decodifica del token:', err)
    return ''
  }
}

function aggiungiFoto() {
  form.foto.push('')
}

// Rimuove una foto per indice
function rimuoviFoto(i) {
  form.foto.splice(i, 1)
}

async function onSubmit() {
  // Azzera errori precedenti prima di ogni invio
  erroriValidazione.value = []

  // Rimuove le URL foto vuote prima di inviare
  const amministratoreId = getIdDalToken()
  const payload = {
    ...form,
    foto: form.foto.filter(url => url.trim() !== ''),
    ...(amministratoreId ? { amministratoreId } : {}),
  }

  try {
    let res
    if (isEdit.value && props.initial?._id) {
      // Aggiornamento appartamento esistente 
      res = await fetch(`${API_BASE}/appartamenti/${props.initial._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
    } else {
      // Creazione nuovo appartamento
      res = await fetch(`${API_BASE}/appartamenti`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
    }

    const body = await res.json()

    if (res.ok) {
      emits('saved', body.data)
    } else if (res.status === 400 && body.errors) {
      // Il backend ha restituito errori di validazione campo per campo
      erroriValidazione.value = body.errors
    } else {
      // Errore generico (es. 401, 403, 500)
      erroriValidazione.value = [body?.message || 'Si è verificato un errore. Riprova.']
    }
  } catch (err) {
    console.error(err)
    erroriValidazione.value = ['Errore di rete. Assicurati che il backend sia avviato.']
  }
}
</script>
