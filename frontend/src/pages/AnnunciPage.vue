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

        <!-- Contatore risultati -->
        <p class="mb-6 text-sm text-zinc-500">
          <span class="font-semibold text-zinc-900">{{ annunci.length }}</span>
          {{ annunci.length === 1 ? 'annuncio trovato' : 'annunci trovati' }}
        </p>

        <!-- Nessun annuncio disponibile -->
        <div
          v-if="annunci.length === 0"
          class="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500"
        >
          <p class="text-lg font-semibold text-zinc-700">Nessun annuncio attivo al momento.</p>
          <p class="mt-2 text-sm">Torna più tardi per nuove disponibilità.</p>
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

        <!-- Sezione mappa interattiva -->
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
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AnnuncioCard from '@/components/shared/AnnuncioCard.vue'
import MappaAnnunci from '@/components/shared/MappaAnnunci.vue'
import { annunciService } from '@/services/annunciService.js'

const router = useRouter()

// Stato della pagina
const annunci = ref([])    // lista annunci ricevuta dal backend
const caricamento = ref(true)
const errore = ref(null)

// Chiama il backend e popola la lista degli annunci
async function caricaAnnunci() {
  caricamento.value = true
  errore.value = null
  try {
    const risposta = await annunciService.getAll()
    annunci.value = risposta.data.data // struttura: { success, count, data: [...] }
  } catch (err) {
    errore.value = err.response?.data?.message ?? 'Errore di rete. Assicurati che il backend sia avviato.'
  } finally {
    caricamento.value = false
  }
}

// Naviga alla pagina di dettaglio quando si clicca su un marker della mappa
function vaiAlDettaglio(idAnnuncio) {
  router.push({ name: 'annuncio-detail', params: { id: idAnnuncio } })
}

// Carica i dati al montaggio del componente
onMounted(caricaAnnunci)
</script>
