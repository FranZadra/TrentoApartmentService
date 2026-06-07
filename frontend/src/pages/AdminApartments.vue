<template>
  <AppLayout>
    <div class="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <!-- Intestazione sezione -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">
            Gestione appartamenti
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            I tuoi appartamenti
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-zinc-500 sm:text-base">
            Controlla gli annunci, modifica i dettagli e aggiungi nuovi appartamenti dalla tua area riservata.
          </p>
        </div>

        <button
          @click="openCreate"
          class="inline-flex items-center justify-center rounded-full bg-[#9a1528] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7f1020]"
        >
          + Nuovo appartamento
        </button>
      </div>

      <!-- Griglia con tutti gli appartamenti -->
      <div v-if="loading" class="text-gray-600">Caricamento...</div>
      <div v-else-if="apartments.length === 0" class="text-gray-600">Nessun appartamento trovato. Clicca su "Nuovo appartamento" per aggiungerne uno!</div>
      <div v-else class="flex flex-col gap-6">
        <div v-for="apt in apartments" :key="apt._id" class="flex flex-col gap-3">
          <ApartmentCard
            :apt="apt"
            :show-annuncio-action="true"
            :show-guasti-action="true"
            :show-bollette-action="true"
            :show-associa-action="true"
            guasti-action-label="Mostra segnalazioni"
            :guasti-count="getGuastiAttiviCount(apt)"
            @view="viewDetails(apt._id)"
            @edit="editApartment(apt)"
            @annuncio="openAnnuncio(apt)"
            @guasti="openGuastiModal(apt)"
            @bollette="openBolletteModal(apt)"
            @associa="openAssociaModal(apt)"
          />
        </div>
      </div>
    </div>
  <!-- Modale Dettagli -->
  <ApartmentDetails v-if="showDetails" :apartmentId="selectedId" @close="closeDetails" @updated="reload" />

  <!-- Form creazione/modifica -->
  <ApartmentForm v-if="showForm" :initial="formInitial" @saved="onSaved" @close="closeForm" />

  <!-- Form annuncio -->
  <AnnuncioForm
    v-if="showAnnuncioForm && selectedApartmentForAnnuncio"
    :apartment="selectedApartmentForAnnuncio"
    :initial-annuncio="annuncioInitial"
    @saved="onAnnuncioSaved"
    @close="closeAnnuncio"
  />
  <!-- Modal risolvi guasto -->
  <div v-if="showResolveModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeResolveModal">
    <div class="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Segnalazioni appartamento</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Conferma presa in carico</h3>
        </div>
        <button type="button" @click="closeResolveModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div class="px-6 py-5">
        <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p class="text-sm font-semibold text-zinc-900">Sei sicuro di voler prendere in carico questa segnalazione?</p>
          <p class="mt-2 text-sm leading-6 text-zinc-600">La segnalazione passerà nello stato <span class="font-semibold text-zinc-900">preso in carico</span> e verrà aggiornata la data di presa in carico.</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 border-t border-zinc-200 px-6 py-5 sm:flex-row sm:justify-end">
        <button @click="closeResolveModal" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100">Chiudi</button>
        <button @click="confirmResolve" class="rounded-full px-5 py-2.5 font-semibold text-white transition hover:bg-[#7f1020]" style="background-color: #9a1528">Conferma</button>
      </div>
    </div>
  </div>

  <!-- Modale segnalazioni appartamento -->
  <div v-if="showGuastiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeGuastiModal">
    <div class="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Segnalazioni appartamento</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Guasti e manutenzioni</h3>
          <p class="mt-2 text-sm text-zinc-600">
            {{ selectedApartmentForGuasti ? (selectedApartmentForGuasti.indirizzo?.via || selectedApartmentForGuasti.titolo || selectedApartmentForGuasti._id) : '' }}
          </p>
        </div>
        <button type="button" @click="closeGuastiModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div class="max-h-[65vh] overflow-auto px-6 py-5 sm:px-8">
        <div v-if="guastiModalLoading" class="text-sm text-zinc-600">Caricamento segnalazioni in corso...</div>

        <template v-else>
          <div class="mb-4 flex items-center justify-between gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Segnalazioni attive</p>
          </div>

          <div v-if="guastiAttiviModal.length === 0" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
            Nessuna segnalazione attiva per questo appartamento.
          </div>

          <ul v-else class="space-y-3">
            <li v-for="g in guastiAttiviModal" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              <!-- Sinistra: dati identificativi -->
              <div class="flex-1">
                <div>
                  <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                    {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                  </strong>
                  <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                </div>
                <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
              </div>

              <!-- Destra: date impilate e pulsante sotto -->
              <div class="flex flex-col items-end gap-3 lg:min-w-[180px]">
                <div class="text-xs text-zinc-500 text-right">
                  <div v-if="g.createdAt || g.dataSegnalazione">
                    <span class="font-semibold">Segnalato: {{ formatoData(g.dataSegnalazione || g.createdAt) }}</span>
                  </div>
                  <div v-if="g.dataPresoInCarico" class="mt-2">
                    <span class="font-semibold">Preso in carico: {{ formatoData(g.dataPresoInCarico) }}</span>
                  </div>
                  <div v-if="g.dataSistemazione" class="mt-2">
                    <span class="font-semibold">Risolto: {{ formatoData(g.dataSistemazione) }}</span>
                  </div>
                </div>
                <button
                  v-if="g.stato === 'segnalato'"
                  @click="openResolveModal(selectedApartmentForGuasti, g)"
                  class="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                >
                  Risolvi
                </button>
              </div>
            </li>
          </ul>

          <div class="mt-6 flex justify-center">
            <button
              type="button"
              class="text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
              @click="mostraStorico = !mostraStorico"
            >
              {{ mostraStorico ? 'Nascondi storico' : 'Visualizza storico' }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="mostraStorico" class="mt-6 border-t border-zinc-200 pt-5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Storico manutenzioni</p>
                <p class="text-xs text-zinc-500">Sistemate e archiviate</p>
              </div>

              <div v-if="guastiStoricoModal.length === 0" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
                Nessuna segnalazione storica disponibile.
              </div>

              <ul v-else class="space-y-3">
                <li v-for="g in guastiStoricoModal" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                  <!-- Sinistra: dati identificativi -->
                  <div class="flex-1">
                    <div>
                      <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                        {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                      </strong>
                      <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                    </div>
                    <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: {{ g.stato }}</div>
                  </div>

                  <!-- Destra: date impilate -->
                  <div class="flex flex-col items-end text-xs text-zinc-500 text-right lg:min-w-[180px]">
                    <div v-if="g.createdAt || g.dataSegnalazione">
                      <span class="font-semibold">Segnalato: {{ formatoData(g.dataSegnalazione || g.createdAt) }}</span>
                    </div>
                    <div v-if="g.dataPresoInCarico" class="mt-2">
                      <span class="font-semibold">Preso in carico: {{ formatoData(g.dataPresoInCarico) }}</span>
                    </div>
                    <div v-if="g.dataSistemazione" class="mt-2">
                      <span class="font-semibold">Sistemato: {{ formatoData(g.dataSistemazione) }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
        </template>
      </div>

      <div class="border-t border-zinc-200 px-6 py-5 sm:px-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button @click="closeGuastiModal" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100">Chiudi</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Modale bollette appartamento -->
  <div v-if="showBolletteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeBolletteModal">
    <div class="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">

      <!-- Intestazione modale -->
      <div class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Gestione bollette</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Bollette appartamento</h3>
          <p class="mt-2 text-sm text-zinc-600">
            {{ selectedApartmentForBollette ? (selectedApartmentForBollette.indirizzo?.via || selectedApartmentForBollette._id) : '' }}
          </p>
        </div>
        <button type="button" @click="closeBolletteModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div class="max-h-[70vh] overflow-auto px-6 py-5 sm:px-8">

        <!-- Form per la nuova bolletta -->
        <div class="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <p class="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Carica nuova bolletta</p>
          <form @submit.prevent="submitNuovaBolletta" class="grid gap-4 sm:grid-cols-2">
            <!-- Utenza -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Utenza</label>
              <select v-model="nuovaBolletta.utenza" required class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]">
                <option value="" disabled>Seleziona...</option>
                <option value="luce">Luce</option>
                <option value="gas">Gas</option>
                <option value="acqua">Acqua</option>
                <option value="elettricità">Elettricità</option>
              </select>
            </div>
            <!-- Importo -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Importo (€)</label>
              <input v-model.number="nuovaBolletta.importo" type="number" min="0" step="0.01" required placeholder="es. 85.50" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
            </div>
            <!-- Periodo inizio -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Periodo — inizio</label>
              <input v-model="nuovaBolletta.periodoInizio" type="date" required class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
            </div>
            <!-- Periodo fine -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Periodo — fine</label>
              <input v-model="nuovaBolletta.periodoFine" type="date" required class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
            </div>
            <!-- PDF -->
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">PDF bolletta (opzionale, max 10 MB)</label>
              <input type="file" accept="application/pdf" @change="onPdfSelezionato" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 file:mr-3 file:rounded-full file:border-0 file:bg-[#9a1528] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white" />
            </div>

            <div v-if="bolletteErrore" class="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ bolletteErrore }}
            </div>
            <div v-if="bolletteSuccesso" class="sm:col-span-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {{ bolletteSuccesso }}
            </div>

            <div class="sm:col-span-2 flex justify-end">
              <button type="submit" :disabled="bollettaInvioInCorso" class="rounded-full bg-[#9a1528] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f1020] disabled:opacity-50">
                {{ bollettaInvioInCorso ? 'Caricamento...' : 'Carica bolletta' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista delle bollette esistenti -->
        <div>
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Bollette caricate</p>

          <div v-if="bolletteModalLoading" class="text-sm text-zinc-600">Caricamento...</div>

          <div v-else-if="bolletteModalList.length === 0" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-600">
            Nessuna bolletta caricata per questo appartamento.
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="b in bolletteModalList"
              :key="b._id"
              class="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="rounded-full px-2 py-0.5 text-xs font-semibold text-white" :class="coloreUtenza(b.utenza)">
                    {{ capitalizeFirst(b.utenza) }}
                  </span>
                  <span class="font-semibold text-zinc-900">€ {{ Number(b.importo).toFixed(2) }}</span>
                  <span v-if="b.pagata" class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pagata</span>
                  <span v-else class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Da pagare</span>
                </div>
                <p class="mt-1 text-xs text-zinc-500">
                  {{ formatoData(b.periodoInizio) }} — {{ formatoData(b.periodoFine) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button v-if="b.pdfNomeFile" type="button" @click="apriPdf(b)" class="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100">
                  PDF
                </button>
                <button v-if="!b.pagata" @click="segnaComePagata(b)" class="rounded-full border border-green-300 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-50">
                  Segna pagata
                </button>
                <button @click="confermaElimina(b)" class="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                  Elimina
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-zinc-200 px-6 py-5 sm:px-8">
        <div class="flex justify-end">
          <button @click="closeBolletteModal" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 transition hover:bg-zinc-100">Chiudi</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modale conferma eliminazione bolletta -->
  <div v-if="showEliminaModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="showEliminaModal = false">
    <div class="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="px-6 pt-6">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Conferma eliminazione</p>
        <h3 class="mt-2 text-xl font-semibold text-zinc-900">Eliminare questa bolletta?</h3>
        <p class="mt-2 text-sm text-zinc-600">L'operazione è irreversibile.</p>
      </div>
      <div class="flex gap-3 border-t border-zinc-200 px-6 py-5 sm:justify-end">
        <button @click="showEliminaModal = false" class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100">Annulla</button>
        <button @click="eseguiElimina" class="rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700">Elimina</button>
      </div>
    </div>
  </div>

  <!-- Modale associazione inquilino-contratto -->
  <div v-if="showAssociaModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeAssociaModal">
    <div class="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[#9a1528]">Associazione inquilino</p>
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">Associa un inquilino</h3>
          <p class="mt-1 text-sm text-zinc-500">{{ selectedApartmentForAssocia?.indirizzo?.via }}</p>
        </div>
        <button type="button" @click="closeAssociaModal" class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900" aria-label="Chiudi">✕</button>
      </div>

      <form @submit.prevent="submitAssocia" class="px-6 py-5 sm:px-8">
        <p class="mb-4 text-sm text-zinc-600">
          Inserisci l'email di un utente verificato senza contratti attivi. Se l'appartamento ha già
          un contratto attivo, l'utente verrà aggiunto come coinquilino; altrimenti compila anche i
          dati del contratto qui sotto.
        </p>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Email utente</label>
            <input v-model="associaForm.email" type="email" required placeholder="nome@example.com" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Data inizio</label>
            <input v-model="associaForm.dataInizio" type="date" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Data fine</label>
            <input v-model="associaForm.dataFine" type="date" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Canone mensile (€)</label>
            <input v-model.number="associaForm.canoneMensile" type="number" min="0" step="0.01" placeholder="es. 850" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">Tipo contratto</label>
            <select v-model="associaForm.tipoContratto" class="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#9a1528]">
              <option value="Residenziale">Residenziale</option>
              <option value="Studenti">Studenti</option>
              <option value="Transitorio">Transitorio</option>
            </select>
          </div>
        </div>

        <div v-if="associaErrore" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ associaErrore }}</div>
        <div v-if="associaSuccesso" class="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{{ associaSuccesso }}</div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" @click="closeAssociaModal" class="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100">Chiudi</button>
          <button type="submit" :disabled="associaInvioInCorso" class="rounded-full bg-[#9a1528] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f1020] disabled:opacity-50">
            {{ associaInvioInCorso ? 'Associazione...' : 'Associa' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  </AppLayout>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import ApartmentDetails from '../components/ApartmentDetails.vue'
import ApartmentForm from '../components/ApartmentForm.vue'
import ApartmentCard from '../components/ApartmentCard.vue'
import AnnuncioForm from '../components/AnnuncioForm.vue'
import { getGuastiAppartamento, prendiInCaricoGuastoAdmin } from '../services/gestioneInternaService'
import { getBolletteAdmin, caricaBolletta, segnaBollettaPagata, eliminaBolletta, apriPdfBolletta } from '../services/bolletteService'

const apartments = ref([])
const loading = ref(false)
const showDetails = ref(false)
const showForm = ref(false)
const showAnnuncioForm = ref(false)
const selectedId = ref(null)
const formInitial = ref(null)
const selectedApartmentForAnnuncio = ref(null)

const showResolveModal = ref(false)
const resolveTargetGuasto = ref(null)
const resolveTargetApartment = ref(null)

const showGuastiModal = ref(false)
const selectedApartmentForGuasti = ref(null)
const guastiModalLoading = ref(false)
const guastiModalGuasti = ref([])
const mostraStorico = ref(false)
const guastiByApartment = ref({})

// Stato modale bollette
const showBolletteModal = ref(false)
const selectedApartmentForBollette = ref(null)
const bolletteModalLoading = ref(false)
const bolletteModalList = ref([])
const bolletteErrore = ref('')
const bolletteSuccesso = ref('')
const bollettaInvioInCorso = ref(false)
const nuovaBolletta = ref({ utenza: '', importo: '', periodoInizio: '', periodoFine: '' })
const pdfSelezionato = ref(null)
const showEliminaModal = ref(false)
const bollettaDaEliminare = ref(null)

// Stato modale "Associa inquilino"
const showAssociaModal = ref(false)
const selectedApartmentForAssocia = ref(null)
const associaForm = ref({ email: '', dataInizio: '', dataFine: '', canoneMensile: null, tipoContratto: 'Residenziale' })
const associaErrore = ref('')
const associaSuccesso = ref('')
const associaInvioInCorso = ref(false)

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

watch([showDetails, showForm, showAnnuncioForm, showGuastiModal, showBolletteModal, showAssociaModal], (stati) => {
  document.body.style.overflow = stati.some(Boolean) ? 'hidden' : ''
})

function getAuthHeaders() {
  const token = localStorage.getItem('tas_token') || localStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

function getAppId(apt) {
  return apt?._id || apt?.id || ''
}

function formatoData(dateValue) {
  if (!dateValue) return '—'
  return new Date(dateValue).toLocaleDateString('it-IT')
}

function getPriorityColor(priorita) {
  const p = (priorita || 'media').toLowerCase()
  switch (p) {
    case 'scarsa':
      return 'text-yellow-700 font-semibold'
    case 'media':
      return 'text-orange-600 font-semibold'
    case 'urgente':
      return 'text-red-700 font-semibold'
    default:
      return 'text-zinc-900 font-semibold'
  }
}

function isRecentResolved(guasto) {
  if (guasto?.stato !== 'sistemato' || !guasto?.dataSistemazione) return false
  const resolvedAt = new Date(guasto.dataSistemazione)
  if (Number.isNaN(resolvedAt.getTime())) return false
  const diffDays = (Date.now() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function isActiveGuasto(guasto) {
  return guasto?.stato === 'segnalato' || guasto?.stato === 'preso in carico'
}

function isStoricoGuasto(guasto) {
  if (!guasto) return false
  if (guasto.stato === 'archiviato') return true
  if (guasto.stato === 'sistemato') return true
  return false
}

function isVisibleGuastoForAdmin(guasto) {
  return isActiveGuasto(guasto) || isStoricoGuasto(guasto)
}

const guastiAttiviModal = computed(() => guastiModalGuasti.value.filter(isActiveGuasto))
const guastiStoricoModal = computed(() => guastiModalGuasti.value.filter(isStoricoGuasto))

function getGuastiAttiviCount(apt) {
  const appId = getAppId(apt)
  if (!appId) return 0

  const cached = guastiByApartment.value[appId] || []
  return cached.filter(isActiveGuasto).length
}

async function loadApartments() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti?proprietario=me&page=1&limit=100`, {
      headers: getAuthHeaders(),
    })
    const body = await res.json()
    if (res.ok && body && body.data) {
      apartments.value = body.data
      await loadGuastiCounts(body.data)
    } else {
      apartments.value = []
      guastiByApartment.value = {}
    }
  } catch (err) {
    console.error(err)
    apartments.value = []
    guastiByApartment.value = {}
  } finally {
    loading.value = false
  }
}
async function loadAllApartments() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti?page=1&limit=10`, {
      headers: getAuthHeaders(),
    })
    const body = await res.json()
    if (res.ok && body && body.data) apartments.value = body.data
    else apartments.value = []
  } catch (err) {
    console.error(err)
    apartments.value = []
  } finally {
    loading.value = false
  }
}

async function loadGuastiCounts(apartmentsList) {
  if (!Array.isArray(apartmentsList) || apartmentsList.length === 0) {
    guastiByApartment.value = {}
    return
  }

  const entries = await Promise.all(
    apartmentsList.map(async (apt) => {
      const appId = getAppId(apt)
      if (!appId) return null

      try {
        const res = await getGuastiAppartamento(appId)
        const guasti = res.success ? (res.data?.data || []) : []
        return [appId, guasti]
      } catch (err) {
        console.error(err)
        return [appId, []]
      }
    }),
  )

  guastiByApartment.value = Object.fromEntries(entries.filter(Boolean))
}

async function loadGuastiModal(apt) {
  const appId = getAppId(apt)
  if (!appId || guastiModalLoading.value) return

  guastiModalLoading.value = true
  try {
    const res = await getGuastiAppartamento(appId)
    if (res.success) {
      const guasti = res.data?.data || []
      guastiModalGuasti.value = guasti
      guastiByApartment.value = {
        ...guastiByApartment.value,
        [appId]: guasti,
      }
    } else {
      console.error(res.error)
      guastiModalGuasti.value = []
    }
  } catch (err) {
    console.error(err)
    guastiModalGuasti.value = []
  } finally {
    guastiModalLoading.value = false
  }
}

async function openGuastiModal(apt) {
  selectedApartmentForGuasti.value = apt
  mostraStorico.value = false
  showGuastiModal.value = true
  await loadGuastiModal(apt)
}

function closeGuastiModal() {
  showGuastiModal.value = false
  selectedApartmentForGuasti.value = null
  guastiModalGuasti.value = []
  mostraStorico.value = false
}

function openResolveModal(apt, guasto) {
  resolveTargetApartment.value = apt
  resolveTargetGuasto.value = guasto
  showResolveModal.value = true
}

function closeResolveModal() {
  showResolveModal.value = false
  resolveTargetGuasto.value = null
  resolveTargetApartment.value = null
}

async function confirmResolve() {
  const guasto = resolveTargetGuasto.value
  const apt = resolveTargetApartment.value
  if (!guasto || !guasto._id) return closeResolveModal()

  try {
    const res = await prendiInCaricoGuastoAdmin(guasto._id)
    if (res.success) {
      await loadGuastiModal(apt)
    } else {
      console.error('Errore resolve:', res.error)
    }
  } catch (err) {
    console.error(err)
  } finally {
    closeResolveModal()
  }
}



function viewDetails(id) {
  selectedId.value = id
  showDetails.value = true
}

function closeDetails() {
  selectedId.value = null
  showDetails.value = false
}

function editApartment(apt) {
  formInitial.value = { ...apt }
  showForm.value = true
}

function openAnnuncio(apt) {
  selectedApartmentForAnnuncio.value = apt
  showAnnuncioForm.value = true
}

function closeAnnuncio() {
  selectedApartmentForAnnuncio.value = null
  showAnnuncioForm.value = false
}

function openCreate() {
  formInitial.value = null
  showForm.value = true
}

function closeForm() {
  formInitial.value = null
  showForm.value = false
}

function onSaved() {
  closeForm()
  loadApartments()
}

function onAnnuncioSaved(annuncio) {
  closeAnnuncio()
  loadApartments()
}

function reload() {
  closeDetails()
  loadApartments()
}

// Funzioni modale bollette
function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function coloreUtenza(utenza) {
  const mappa = { luce: 'bg-amber-500', gas: 'bg-blue-500', acqua: 'bg-cyan-500', elettricità: 'bg-violet-500' }
  return mappa[utenza] || 'bg-zinc-500'
}

function onPdfSelezionato(event) {
  pdfSelezionato.value = event.target.files[0] || null
}

// Apre il PDF della bolletta passando dal service
async function apriPdf(bolletta) {
  const res = await apriPdfBolletta(bolletta._id)
  if (!res.success) bolletteErrore.value = res.error
}

async function openBolletteModal(apt) {
  selectedApartmentForBollette.value = apt
  showBolletteModal.value = true
  bolletteErrore.value = ''
  bolletteSuccesso.value = ''
  nuovaBolletta.value = { utenza: '', importo: '', periodoInizio: '', periodoFine: '' }
  pdfSelezionato.value = null
  await caricaListaBollette(apt)
}

// Associazione inquilino
function openAssociaModal(apt) {
  selectedApartmentForAssocia.value = apt
  associaForm.value = { email: '', dataInizio: '', dataFine: '', canoneMensile: null, tipoContratto: 'Residenziale' }
  associaErrore.value = ''
  associaSuccesso.value = ''
  showAssociaModal.value = true
}

function closeAssociaModal() {
  showAssociaModal.value = false
  selectedApartmentForAssocia.value = null
}

async function submitAssocia() {
  associaErrore.value = ''
  associaSuccesso.value = ''
  associaInvioInCorso.value = true
  try {
    const res = await fetch(`${API_BASE}/appartamenti/${selectedApartmentForAssocia.value._id}/associa-inquilino`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(associaForm.value),
    })
    const body = await res.json()
    if (res.ok) {
      associaSuccesso.value = body.message || 'Inquilino associato con successo'
      // Ricarica appartamenti
      await reload()
    } else {
      associaErrore.value = body.message || 'Errore durante l\'associazione'
    }
  } catch (err) {
    associaErrore.value = 'Errore di rete. Assicurati che il backend sia avviato.'
  } finally {
    associaInvioInCorso.value = false
  }
}

function closeBolletteModal() {
  showBolletteModal.value = false
  selectedApartmentForBollette.value = null
  bolletteModalList.value = []
  bolletteErrore.value = ''
  bolletteSuccesso.value = ''
}

async function caricaListaBollette(apt) {
  const appId = getAppId(apt)
  if (!appId) return
  bolletteModalLoading.value = true
  const res = await getBolletteAdmin(appId)
  bolletteModalList.value = res.success ? (res.data?.data || []) : []
  bolletteModalLoading.value = false
}

async function submitNuovaBolletta() {
  bolletteErrore.value = ''
  bolletteSuccesso.value = ''
  bollettaInvioInCorso.value = true

  const appId = getAppId(selectedApartmentForBollette.value)
  const formData = new FormData()
  formData.append('utenza', nuovaBolletta.value.utenza)
  formData.append('importo', nuovaBolletta.value.importo)
  formData.append('periodoInizio', nuovaBolletta.value.periodoInizio)
  formData.append('periodoFine', nuovaBolletta.value.periodoFine)
  if (pdfSelezionato.value) formData.append('pdf', pdfSelezionato.value)

  const res = await caricaBolletta(appId, formData)
  if (res.success) {
    bolletteSuccesso.value = 'Bolletta caricata con successo.'
    nuovaBolletta.value = { utenza: '', importo: '', periodoInizio: '', periodoFine: '' }
    pdfSelezionato.value = null
    await caricaListaBollette(selectedApartmentForBollette.value)
  } else {
    bolletteErrore.value = res.error || 'Errore durante il caricamento.'
  }
  bollettaInvioInCorso.value = false
}

async function segnaComePagata(bolletta) {
  bolletteErrore.value = ''
  bolletteSuccesso.value = ''
  const res = await segnaBollettaPagata(bolletta._id)
  if (res.success) {
    bolletteSuccesso.value = 'Bolletta segnata come pagata.'
    await caricaListaBollette(selectedApartmentForBollette.value)
  } else {
    bolletteErrore.value = res.error
  }
}

function confermaElimina(bolletta) {
  bollettaDaEliminare.value = bolletta
  showEliminaModal.value = true
}

async function eseguiElimina() {
  showEliminaModal.value = false
  bolletteErrore.value = ''
  bolletteSuccesso.value = ''
  const res = await eliminaBolletta(bollettaDaEliminare.value._id)
  if (res.success) {
    bolletteSuccesso.value = 'Bolletta eliminata.'
    await caricaListaBollette(selectedApartmentForBollette.value)
  } else {
    bolletteErrore.value = res.error
  }
  bollettaDaEliminare.value = null
}

// Ascolta evento globale emesso dal componente dettagli per aprire il form
function onGlobalEdit(e) {
  const apt = e.detail
  if (apt) {
    formInitial.value = { ...apt }
    showForm.value = true
  }
}

onMounted(() => {
  // Carica solo gli appartamenti dell'admin loggato
  loadApartments()
  window.addEventListener('admin:editApartment', onGlobalEdit)
})

onUnmounted(() => {
  window.removeEventListener('admin:editApartment', onGlobalEdit)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
