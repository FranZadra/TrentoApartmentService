<template>
  <!-- Modal di segnalazione guasto da notificare all'amministratore-->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528]">Guasto</p>
          <h2 class="mt-1 text-2xl font-bold text-zinc-900">Segnala un guasto</h2>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Chiudi"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Appartamento interessato</p>
        <p class="mt-2 text-base font-semibold text-zinc-900">{{ indirizzoCompleto }}</p>
        <p class="mt-1 text-sm text-zinc-600">La segnalazione verrà associata al tuo contratto attivo.</p>
      </div>

      <div v-if="erroriValidazione.length > 0" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p class="mb-2 text-sm font-semibold text-red-700">Correggi i seguenti errori:</p>
        <ul class="list-inside list-disc space-y-1">
          <li v-for="(err, i) in erroriValidazione" :key="i" class="text-sm text-red-600">{{ err }}</li>
        </ul>
      </div>

      <!-- Form di segnalazione guasto -->
      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Categoria</label>
            <select
              v-model="form.categoria"
              class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none"
            >
              <option value="">Seleziona una categoria</option>
              <option v-for="categoria in categorie" :key="categoria" :value="categoria">{{ categoria }}</option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-700">Priorità</label>
            <select
              v-model="form.priorita"
              class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none"
            >
              <option v-for="priorita in prioritaOptions" :key="priorita.value" :value="priorita.value">{{ priorita.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-700">Descrizione del guasto</label>
          <textarea
            v-model.trim="form.descrizione"
            rows="5"
            placeholder="Descrivi il problema nel modo più preciso possibile..."
            class="block w-full rounded border border-gray-300 px-3 py-2 transition-colors focus:border-[#9a1528] focus:outline-none"
          ></textarea>
        </div>

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

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Annulla
          </button>
          <button type="submit" class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
            Invia segnalazione
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { segnalaGuasto } from '../services/gestioneInternaService'

const props = defineProps({
  apartment: { type: [Object, String], default: null },
})

const emits = defineEmits(['saved', 'close'])

const categorie = ['Elettrico', 'Idraulico', 'Infissi', 'Riscaldamento', 'Elettrodomestici', 'Struttura', 'Altro']
const prioritaOptions = [
  { label: 'Scarsa', value: 'scarsa' },
  { label: 'Media', value: 'media' },
  { label: 'Urgente', value: 'urgente' },
]

const erroriValidazione = ref([])

const defaultForm = () => ({
  descrizione: '',
  categoria: '',
  priorita: 'media',
  foto: [],
})

const form = reactive(defaultForm())

const apartmentId = computed(() => {
  if (!props.apartment) return ''
  if (typeof props.apartment === 'string') return props.apartment
  return props.apartment._id || props.apartment.id || ''
})

const indirizzoCompleto = computed(() => {
  const appartamento = props.apartment && typeof props.apartment === 'object' ? props.apartment : null
  if (!appartamento?.indirizzo) return 'Appartamento non disponibile'

  const { via, numero, città } = appartamento.indirizzo
  return `${via || 'Via sconosciuta'} ${numero || ''}${città ? `, ${città}` : ''}`.trim()
})

watch(
  () => props.apartment,
  () => {
    erroriValidazione.value = []
    Object.assign(form, defaultForm())
  },
  { immediate: true }
)

function aggiungiFoto() {
  form.foto.push('')
}

function rimuoviFoto(i) {
  form.foto.splice(i, 1)
}

async function onSubmit() {
  erroriValidazione.value = []

  if (!apartmentId.value) {
    erroriValidazione.value = ['Nessun appartamento attivo disponibile per la segnalazione.']
    return
  }

  const payload = {
    idAppartamento: apartmentId.value,
    descrizione: form.descrizione,
    categoria: form.categoria || 'Altro',
    priorita: form.priorita,
    foto: form.foto.filter((url) => url.trim() !== ''),
  }

  const response = await segnalaGuasto(payload)

  if (response.success) {
    emits('saved', response.data)
  } else if (response.status === 400 && Array.isArray(response.errors)) {
    erroriValidazione.value = response.errors
  } else {
    erroriValidazione.value = [response.error || 'Si è verificato un errore. Riprova.']
  }
}
</script>
