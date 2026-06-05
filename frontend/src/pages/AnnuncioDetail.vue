<template>
  <AppLayout>
    <div class="mx-auto max-w-[1200px] px-6 py-12 lg:px-8">

      <!-- Stato di caricamento -->
      <div v-if="caricamento" class="flex items-center justify-center py-24">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-[#9a1528]"></div>
      </div>

      <!-- Errore (annuncio non trovato o ID non valido) -->
      <div
        v-else-if="errore"
        class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"
      >
        <p class="font-semibold text-lg">{{ errore }}</p>
        <router-link
          :to="{ name: 'annunci' }"
          class="mt-4 inline-block rounded-full bg-[#9a1528] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7f1020]"
        >
          ← Torna agli annunci
        </router-link>
      </div>

      <!-- Contenuto del dettaglio annuncio -->
      <template v-else-if="annuncio">

        <nav class="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <router-link :to="{ name: 'annunci' }" class="hover:text-[#9a1528]">Annunci</router-link>
          <span>/</span>
          <span class="text-zinc-900 font-medium">{{ indirizzoBreve }}</span>
        </nav>

        <!-- Galleria fotografica -->
        <section class="mb-10">
          <!-- Nessuna foto: mostra placeholder -->
          <div
            v-if="!haFoto"
            class="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-100 text-zinc-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-6H9v6H3.75A.75.75 0 013 21V9.75z" />
            </svg>
            <p class="text-sm font-medium">Nessuna foto disponibile per questo annuncio</p>
          </div>

          <!-- Galleria con scorrimento orizzontale -->
          <div v-else class="relative">
            <!-- Immagine principale: mostra quella selezionata dall'indice -->
            <div class="relative h-80 w-full overflow-hidden rounded-2xl bg-zinc-100 sm:h-96">
              <img
                :src="foto[fotoCorrente]"
                :alt="`Foto ${fotoCorrente + 1} di ${indirizzoBreve}`"
                class="h-full w-full object-cover"
              />

              <!-- Freccia sinistra -->
              <button
                v-if="foto.length > 1 && fotoCorrente > 0"
                @click="fotoCorrente--"
                class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                aria-label="Foto precedente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <!-- Freccia destra -->
              <button
                v-if="foto.length > 1 && fotoCorrente < foto.length - 1"
                @click="fotoCorrente++"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                aria-label="Foto successiva"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Indicatore posizione -->
              <span
                v-if="foto.length > 1"
                class="absolute bottom-3 right-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white"
              >
                {{ fotoCorrente + 1 }} / {{ foto.length }}
              </span>
            </div>

            <div v-if="foto.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                v-for="(url, i) in foto"
                :key="i"
                @click="fotoCorrente = i"
                :class="[
                  'h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  i === fotoCorrente ? 'border-[#9a1528]' : 'border-transparent opacity-60 hover:opacity-100',
                ]"
              >
                <img :src="url" :alt="`Miniatura ${i + 1}`" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>
        </section>

        <!-- Informazioni principali -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">

          <!-- Colonna sinistra: dettagli principali -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Titolo e indirizzo completo -->
            <div>
              <h1 class="font-display text-3xl font-bold text-zinc-900">
                {{ indirizzoBreve }}
              </h1>
              <p class="mt-1 text-sm text-zinc-500">
                {{ indirizzoCompleto }}
              </p>
            </div>

            <!-- Descrizione dell'annuncio -->
            <div>
              <h2 class="mb-2 font-display text-lg font-bold text-zinc-800">Descrizione</h2>
              <p class="text-zinc-600 leading-relaxed whitespace-pre-line">
                {{ annuncio.descrizione }}
              </p>
            </div>

            <!-- Servizi e dotazioni -->
            <div>
              <h2 class="mb-3 font-display text-lg font-bold text-zinc-800">Dotazioni</h2>
              <div class="flex flex-wrap gap-2">
                <span class="chip-dettaglio">
                  🛏 {{ annuncio.appartamento.numStanze }}
                  {{ annuncio.appartamento.numStanze === 1 ? 'stanza' : 'stanze' }}
                </span>
                <span class="chip-dettaglio">
                  🚿 {{ annuncio.appartamento.numBagni }}
                  {{ annuncio.appartamento.numBagni === 1 ? 'bagno' : 'bagni' }}
                </span>
                <span v-if="annuncio.appartamento.terrazzo" class="chip-dettaglio">🌿 Terrazzo</span>
                <span v-if="annuncio.appartamento.lavatrice" class="chip-dettaglio">🫧 Lavatrice</span>
                <span v-if="annuncio.appartamento.studentOnly" class="chip-dettaglio bg-[#9a1528]/10 text-[#9a1528]">
                  🎓 Solo studenti
                </span>
                <span
                  v-if="annuncio.appartamento.classeEnergetica"
                  class="chip-dettaglio bg-emerald-50 text-emerald-700"
                >
                  ⚡ Classe {{ annuncio.appartamento.classeEnergetica }}
                </span>
              </div>
            </div>
          </div>

          <!-- Colonna destra: scheda riepilogativa -->
          <div>
            <div class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a1528]">
                Annuncio attivo
              </p>
              <p class="mt-3 text-sm text-zinc-500">
                Pubblicato il
                <span class="font-semibold text-zinc-800">{{ dataFormattata }}</span>
              </p>
              <hr class="my-4 border-zinc-100" />

              <!-- Contatto amministratore: il numero e il pulsante per contattare l'amministratore sono
                   visibili solo agli utenti registrati -->
              <template v-if="auth.isAuthenticated">
                <template v-if="contattoAdmin?.linkWhatsApp">
                  <p class="text-sm text-zinc-600 leading-relaxed">
                    Contatta direttamente l'amministratore dell'appartamento.
                  </p>
                  <a
                    :href="contattoAdmin.linkWhatsApp"
                    target="_blank"
                    rel="noopener"
                    class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1da851]"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.5 14.4c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.5-.5-.68-.5h-.58c-.2 0-.53.07-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.3 1.28.49 1.71.63.72.23 1.38.2 1.9.12.58-.08 1.8-.73 2.05-1.44.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35z M12 2a10 10 0 00-8.6 15.04L2 22l5.1-1.34A10 10 0 1012 2zm0 1.8a8.2 8.2 0 016.7 12.92l.1.15-.6 2.18-2.24-.59-.14.08A8.2 8.2 0 1112 3.8z"/>
                    </svg>
                    Contatta su WhatsApp
                  </a>
                </template>
                <p v-else class="text-sm text-zinc-500 leading-relaxed">
                  L'amministratore non ha indicato un recapito telefonico.
                </p>
              </template>

              <!-- Per utente non autenticato -->
              <template v-else>
                <p class="text-sm text-zinc-600 leading-relaxed">
                  Accedi o registrati per contattare l'amministratore dell'appartamento.
                </p>
                <router-link
                  :to="{ name: 'accesso' }"
                  class="mt-4 inline-block w-full rounded-full bg-[#9a1528] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#7f1020]"
                >
                  Accedi / Registrati
                </router-link>
              </template>

              <router-link
                :to="{ name: 'annunci' }"
                class="mt-3 inline-block w-full rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 hover:border-[#9a1528] hover:text-[#9a1528] transition-colors"
              >
                ← Tutti gli annunci
              </router-link>
            </div>
          </div>
        </div>

        <!-- Mappa posizione appartamento -->
        <section
          v-if="haCoordinate"
          class="mt-12"
        >
          <h2 class="mb-4 font-display text-xl font-bold text-zinc-900">Posizione</h2>
          <MappaDettaglio
            :latitudine="annuncio.appartamento.posizione.latitudine"
            :longitudine="annuncio.appartamento.posizione.longitudine"
            :etichetta="indirizzoBreve"
          />
        </section>

        <!-- Avviso se le coordinate non sono disponibili nel DB -->
        <div
          v-else
          class="mt-12 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-500"
        >
          Posizione sulla mappa non disponibile per questo annuncio.
        </div>

      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import MappaDettaglio from '@/components/shared/MappaDettaglio.vue'
import { annunciService } from '@/services/annunciService.js'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Stato della pagina
const annuncio = ref(null)  // dati dell'annuncio con appartamento popolato
const caricamento = ref(true)
const errore = ref(null)
const fotoCorrente = ref(0) // indice della foto mostrata nella galleria
// Dati di contatto dell'admin (solo se autenticati).
const contattoAdmin = ref(null)

// Array di foto dell'appartamento
const foto = computed(() => annuncio.value?.appartamento?.foto ?? [])
const haFoto = computed(() => foto.value.length > 0)

// true se il DB contiene le coordinate geografiche
const haCoordinate = computed(() => {
  const pos = annuncio.value?.appartamento?.posizione
  return !!(pos?.latitudine && pos?.longitudine)
})

// Indirizzo breve usato nel titolo
const indirizzoBreve = computed(() => {
  const a = annuncio.value?.appartamento?.indirizzo
  if (!a) return ''
  return `${a.via} ${a.numero}, ${a.città}`
})

// Indirizzo completo con CAP e stato, usato sotto il titolo
const indirizzoCompleto = computed(() => {
  const a = annuncio.value?.appartamento?.indirizzo
  if (!a) return ''
  return `${a.CAP} ${a.città} — ${a.Stato}`
})

// Data in formato leggibile
const dataFormattata = computed(() => {
  if (!annuncio.value?.dataPubbl) return ''
  return new Date(annuncio.value.dataPubbl).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Carica il dettaglio dell'annuncio dal backend usando l'ID nell'URL
async function caricaDettaglio() {
  caricamento.value = true
  errore.value = null
  try {
    const risposta = await annunciService.getById(route.params.id)
    annuncio.value = risposta.data.data

    // Il contatto dell'admin viene caricato solo se l'utente è autenticato
    const appartamentoId = annuncio.value?.appartamento?._id || annuncio.value?.appartamentoId?._id
    if (auth.isAuthenticated && appartamentoId) {
      try {
        const c = await annunciService.getContattoAdmin(appartamentoId)
        contattoAdmin.value = c.data.data
      } catch {
        // Se il contatto non è recuperabile non blocchiamo la pagina dell'annuncio
        contattoAdmin.value = null
      }
    }
  } catch (err) {
    const status = err.response?.status
    if (status === 404) {
      errore.value = 'Annuncio non trovato. Potrebbe essere stato rimosso.'
    } else if (status === 400) {
      errore.value = 'ID annuncio non valido.'
    } else {
      errore.value = 'Errore nel caricamento. Assicurati che il backend sia avviato.'
    }
  } finally {
    caricamento.value = false
  }
}

onMounted(caricaDettaglio)
</script>

<style scoped>
.chip-dettaglio {
  @apply rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700;
}
</style>
