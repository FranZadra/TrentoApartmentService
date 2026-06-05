<template>
  <AppLayout>
    <div class="mx-auto max-w-[1200px] px-6 py-12 lg:px-8">

      <!-- Intestazione sezione -->
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#9a1528]">
          Ricerca appartamento
        </p>
        <h1 class="mt-2 font-display text-4xl font-bold text-zinc-900">
          Annunci disponibili
        </h1>
        <p class="mt-2 text-zinc-500">
          Trova la soluzione giusta tra i nostri appartamenti disponibili a Trento.
        </p>
      </div>

      <!-- Stato di caricamento -->
      <div v-if="caricamento" class="flex items-center justify-center py-24">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#9a1528]"></div>
      </div>

      <!-- Messaggio di errore dal backend -->
      <div
        v-else-if="errore"
        class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
      >
        <p class="font-semibold">Impossibile caricare gli annunci.</p>
        <p class="mt-1 text-sm">{{ errore }}</p>
        <button
          @click="caricaAnnunci"
          class="mt-4 rounded-full bg-[#9a1528] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7f1020]"
        >
          Riprova
        </button>
      </div>

      <!-- Contenuto principale: lista + mappa -->
      <template v-else>

        <!-- Barra controlli: pulsante filtri + contatore -->
        <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <p class="text-sm text-zinc-500">
            <span class="font-semibold text-zinc-900">{{ annunci.length }}</span>
            {{ annunci.length === 1 ? 'annuncio trovato' : 'annunci trovati' }}
          </p>
          <button
            @click="apriModaleFiltri"
            class="flex items-center gap-2 rounded-lg bg-[#9a1528] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7f1020]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtri
          </button>
        </div>

        <!-- Tag filtri attivi -->
        <FilterTags
          :filtri="filtriAttivi"
          @remove-filter="rimuoviFiltro"
          @clear-all="cancellaFiltri"
        />

        <!-- Nessun annuncio disponibile -->
        <div
          v-if="annunci.length === 0"
          class="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500"
        >
          <template v-if="Object.keys(filtriAttivi).length > 0">
            <p class="text-lg font-semibold text-zinc-700">Nessun annuncio trovato con i filtri selezionati.</p>
            <p class="mt-2 text-sm">Prova a modificare o rimuovere alcuni filtri.</p>
          </template>
          <template v-else>
            <p class="text-lg font-semibold text-zinc-700">Nessun annuncio attivo al momento.</p>
            <p class="mt-2 text-sm">Torna più tardi per nuove disponibilità.</p>
          </template>
        </div>

        <!-- Griglia delle card annunci -->
        <div
          v-else
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnnuncioCard
            v-for="annuncio in annunci"
            :key="annuncio._id"
            :annuncio="annuncio"
          />
        </div>

        <!-- Sezione delle mappa interattiva -->
        <div class="mt-14" v-if="annunci.length > 0">
          <h2 class="mb-4 font-display text-2xl font-bold text-zinc-900">
            Posizione sulla mappa
          </h2>
          <p class="mb-4 text-sm text-zinc-500">
            Clicca su un marker per vedere il riepilogo dell'annuncio.
          </p>
          <MappaAnnunci :annunci="annunci" @marker-click="vaiAlDettaglio" />
        </div>

      </template>
    </div>

    <!-- Modale filtri -->
    <FilterModal
      :isOpen="modaleFiltriAperta"
      :filtriAttuali="filtriAttivi"
      @close="chiudiModaleFiltri"
      @apply="applicaFiltri"
    />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AnnuncioCard from '@/components/shared/AnnuncioCard.vue'
import MappaAnnunci from '@/components/shared/MappaAnnunci.vue'
import FilterModal from '@/components/shared/FilterModal.vue'
import FilterTags from '@/components/shared/FilterTags.vue'
import { annunciService } from '@/services/annunciService.js'

const router = useRouter()

// Stato della pagina
const annunci = ref([])           // lista annunci ricevuta dal backend
const caricamento = ref(true)
const errore = ref(null)
const modaleFiltriAperta = ref(false)
const filtriAttivi = ref({})      // filtri attualmente applicati

// Carica annunci
async function caricaAnnunci() {
  caricamento.value = true
  errore.value = null
  try {
    let risposta
    if (Object.keys(filtriAttivi.value).length === 0) {
      // Nessun filtro: usa l'endpoint di default
      risposta = await annunciService.getAll()
    } else {
      // Con filtri: usa l'endpoint di ricerca
      risposta = await annunciService.searchWithFilters(filtriAttivi.value)
    }
    annunci.value = risposta.data.data // struttura: { success, count, data: [...] }
  } catch (err) {
    errore.value = err.response?.data?.message ?? 'Errore di rete. Assicurati che il backend sia avviato.'
  } finally {
    caricamento.value = false
  }
}

// Apre la modale filtri
function apriModaleFiltri() {
  modaleFiltriAperta.value = true
}

// Chiude la modale filtri
function chiudiModaleFiltri() {
  modaleFiltriAperta.value = false
}

// Applica i filtri selezionati e ricarica gli annunci
async function applicaFiltri(nuoviFiltri) {
  filtriAttivi.value = { ...nuoviFiltri }
  await caricaAnnunci()
}

// Rimuove un singolo filtro e ricarica
async function rimuoviFiltro(chiaveFiltro) {
  delete filtriAttivi.value[chiaveFiltro]
  filtriAttivi.value = { ...filtriAttivi.value }
  await caricaAnnunci()
}

// Cancella tutti i filtri e ricarica
async function cancellaFiltri() {
  filtriAttivi.value = {}
  await caricaAnnunci()
}

// Naviga alla pagina di dettaglio quando si clicca su un marker della mappa
function vaiAlDettaglio(idAnnuncio) {
  router.push({ name: 'annuncio-detail', params: { id: idAnnuncio } })
}

// Carica i dati al montaggio del componente
onMounted(caricaAnnunci)
</script>
