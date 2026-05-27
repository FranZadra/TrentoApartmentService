<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528]">Annuncio immobile</p>
          <h2 class="mt-1 text-2xl font-bold text-zinc-900">{{ modalTitle }}</h2>
        </div>
        <button type="button" @click="$emit('close')" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

          <div class="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Immobile collegato</p>
            <p class="mt-1 text-sm font-semibold text-zinc-900">{{ apartmentLabel }}</p>
            <p class="mt-1 text-sm text-zinc-500">{{ apartmentCity }}</p>
          </div>

          <div v-if="loadingAnnuncio" class="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Caricamento annuncio...
          </div>

          <div v-else>
            <div v-if="!annuncioEsistente && !editing" class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Non esiste ancora un annuncio legato a questo immobile
            </div>

            <div v-if="errorMessage" class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {{ errorMessage }}
            </div>

            <!-- Read-only view when an announcement exists and user is not editing -->
            <div v-if="annuncioEsistente && !editing" class="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              <p class="text-sm font-semibold text-zinc-900">Stato</p>
              <p class="mb-3">{{ annuncioEsistente.stato || (annuncioEsistente.attivo ? 'Attivo' : 'Archiviato') }}</p>
              <p class="text-sm font-semibold text-zinc-900">Descrizione</p>
              <p class="whitespace-pre-line mt-2 text-sm text-zinc-700">{{ annuncioEsistente.descrizione }}</p>
            </div>

            <!-- Edit/Create form -->
            <form v-if="editing" @submit.prevent="onSubmit" class="space-y-6">
              <div class="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
                <div>
                  <p class="text-sm font-semibold text-zinc-900">Stato annuncio</p>
                  <p class="text-sm text-zinc-500">Attiva o disattiva la pubblicazione.</p>
                </div>
                <label class="inline-flex cursor-pointer items-center gap-3">
                  <span class="text-sm font-medium text-zinc-700">Non attivo</span>
                  <input v-model="form.attivo" type="checkbox" class="peer sr-only" />
                  <span class="relative h-7 w-12 rounded-full bg-zinc-200 transition peer-checked:bg-[#9a1528] after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"></span>
                  <span class="text-sm font-medium text-zinc-700">Attivo</span>
                </label>
              </div>

              <div>
                <label class="mb-2 block text-sm font-semibold text-zinc-700">Descrizione</label>
                <textarea
                  v-model="form.descrizione"
                  rows="7"
                  class="block w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm leading-6 transition-colors focus:border-[#9a1528] focus:outline-none"
                  placeholder="Descrivi l'appartamento, i servizi inclusi e le condizioni principali..."
                />
              </div>

              <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
                <button type="button" @click="onCancelEdit" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">
                  Annulla
                </button>
                <button type="submit" class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
                  {{ annuncioEsistente ? 'Aggiorna' : 'Crea annuncio' }}
                </button>
                <button v-if="annuncioEsistente" type="button" @click="onDelete" class="rounded-full border border-red-500 px-5 py-2.5 font-semibold text-red-600 hover:bg-red-50">
                  Elimina
                </button>
              </div>
            </form>

            <!-- Footer actions when in read-only or no-annuncio state -->
            <div v-if="!editing" class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
              <button type="button" @click="$emit('close')" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">
                Chiudi
              </button>
              <button v-if="annuncioEsistente" type="button" @click="startEditing" class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
                Modifica
              </button>
              <button v-else type="button" @click="startEditing" class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
                Crea annuncio
              </button>
            </div>
          </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { annunciService } from '@/services/annunciService'

const props = defineProps({
  apartment: {
    type: Object,
    required: true,
  },
  initialAnnuncio: {
    type: Object,
    default: null,
  },
})

const emits = defineEmits(['saved', 'close'])

const errorMessage = ref('')
const loadingAnnuncio = ref(false)
const annuncioEsistente = ref(props.initialAnnuncio)

const editing = ref(false)

const defaultForm = () => ({
  attivo: true,
  descrizione: '',
})

const form = reactive(defaultForm())

const isEdit = computed(() => editing.value)
const modalTitle = computed(() => {
  if (editing.value) return annuncioEsistente.value ? 'Modifica annuncio' : 'Crea annuncio'
  return 'Annuncio immobile'
})

const apartmentLabel = computed(() => {
  const indirizzo = props.apartment?.indirizzo
  if (!indirizzo) return 'Indirizzo non disponibile'
  return `${indirizzo.via || ''} ${indirizzo.numero || ''}`.trim() || 'Indirizzo non disponibile'
})

const apartmentCity = computed(() => props.apartment?.indirizzo?.città || '-')

watch(
  () => props.initialAnnuncio,
  (value) => {
    annuncioEsistente.value = value || null
    popolaForm(value)
    editing.value = false
  },
  { immediate: true },
)

watch(
  () => props.apartment?._id,
  async (appartamentoId) => {
    if (!appartamentoId) return
    await caricaAnnuncio()
  },
  { immediate: true },
)

function popolaForm(value) {
  errorMessage.value = ''
  Object.assign(form, defaultForm())
  if (value) {
    Object.assign(form, {
      attivo: value.attivo !== undefined ? !!value.attivo : value.stato === 'Attivo',
      descrizione: value.descrizione || '',
    })
  }
}

async function caricaAnnuncio() {
  const apartmentId = props.apartment?._id
  if (!apartmentId) return

  loadingAnnuncio.value = true
  try {
    const response = await annunciService.getByApartmentId(apartmentId)
    annuncioEsistente.value = response.data?.data || null
    popolaForm(annuncioEsistente.value)
  } catch (error) {
    if (error.response?.status === 404) {
      annuncioEsistente.value = null
      popolaForm(null)
    } else {
      errorMessage.value = error.response?.data?.message || "Errore nel caricamento dell'annuncio."
    }
  } finally {
    loadingAnnuncio.value = false
  }
}

function startEditing() {
  editing.value = true
  popolaForm(annuncioEsistente.value)
}

function onCancelEdit() {
  editing.value = false
  popolaForm(annuncioEsistente.value)
}

async function onDelete() {
  errorMessage.value = ''
  if (!annuncioEsistente.value || !annuncioEsistente.value._id) return
  const ok = window.confirm('Sei sicuro di voler eliminare questo annuncio?')
  if (!ok) return

  try {
    await annunciService.deleteById(annuncioEsistente.value._id)
    annuncioEsistente.value = null
    popolaForm(null)
    editing.value = false
    emits('saved', null)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Errore durante l'eliminazione dell'annuncio."
  }
}

async function onSubmit() {
  errorMessage.value = ''

  if (!form.descrizione.trim()) {
    errorMessage.value = "Inserisci una descrizione per l'annuncio."
    return
  }

  try {
    const apartmentId = props.apartment?._id
    if (!apartmentId) {
      errorMessage.value = 'Immobile non disponibile.'
      return
    }

    const payload = {
      descrizione: form.descrizione.trim(),
      attivo: form.attivo,
      stato: form.attivo ? 'Attivo' : 'Archiviato',
      dataPubbl: annuncioEsistente.value?.dataPubbl,
    }

    const response = await annunciService.upsertByApartmentId(apartmentId, payload)
    annuncioEsistente.value = response.data?.data || null
    editing.value = false
    emits('saved', annuncioEsistente.value)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Errore durante il salvataggio dell'annuncio."
  }
}
</script>