<template>
    <AppLayout>
  <main class="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
    <section class="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
      <header class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Gestione interna</p>
        <h1 class="mt-2 text-3xl font-display text-zinc-900 sm:text-4xl">I tuoi appartamenti</h1>
      </header>

      <div v-if="isLoading" class="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-600 shadow-sm">
        Caricamento contratti in corso...
      </div>

      <div v-else-if="errorMessage" class="w-full rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
        {{ errorMessage }}
      </div>

      <div v-else class="w-full space-y-8">
        <div v-if="!contratti.length" class="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 shadow-sm">
          Non hai alcun contratto registrato a tuo nome.
        </div>

        <div v-else-if="contrattoAttivo && vistaAttiva === 'info'" class="w-full rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div class="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start">
            <!-- Sezione sinistra: dati appartamento e guasti -->
            <div class="flex-1">
              <div class="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Contratto attuale</p>
                <h2 class="mt-2 text-2xl font-display text-zinc-900">
                  {{ indirizzoCompleto(contrattoAttivo?.idAppartamento) }}
                </h2>

                <div class="mt-4 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
                  <div class="rounded-2xl bg-white px-4 py-3">Stanze: <strong>{{ contrattoAttivo?.idAppartamento?.numStanze ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Bagni: <strong>{{ contrattoAttivo?.idAppartamento?.numBagni ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Canone mensile: <strong>€ {{ contrattoAttivo?.canoneMensile ?? '—' }}</strong></div>
                  <div class="rounded-2xl bg-white px-4 py-3">Stato: <strong>{{ capitalizeFirst(contrattoAttivo?.stato) }}</strong></div>
                </div>
              </div>

              <div v-if="successMessage" class="mt-4 rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                {{ successMessage }}
              </div>
            </div>

            <!-- Sezione destra: azioni rapide -->
            <div class="flex flex-col items-stretch justify-start gap-3 lg:w-56">
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="apriCalendarioCondiviso"
              >
                Faccende
              </button>
                
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="azionePlaceholder('spesa')"
                >
                Lista spesa
              </button>
              
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="azionePlaceholder('consumi')"
              >
                Consumi
              </button>

              <button
                type="button"
                :disabled="!appartamentoAttivo"
                class="rounded-full px-5 py-3 text-sm font-semibold text-white transition"
                :class="appartamentoAttivo ? 'bg-primary hover:bg-primary-dark' : 'cursor-not-allowed bg-zinc-300 text-zinc-600'"
                @click="vaiAGuasti"
              >
                Segnala un guasto
              </button>
            </div>
          </div>

          <!-- Sezione bollette: lista e grafici consumi -->
          <div class="px-6 sm:px-8 mb-4">
            <div class="mt-2 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              <div class="mb-2 flex items-center justify-between gap-3 px-4">
                <p class="flex h-7 items-center text-xs font-semibold uppercase leading-none tracking-[0.2em] text-zinc-500">
                  Bollette
                </p>
                <button
                  type="button"
                  class="flex h-7 items-center text-xs font-semibold leading-none text-primary transition hover:text-primary-dark hover:underline"
                  @click="mostraBollette = !mostraBollette"
                >
                  {{ mostraBollette ? 'Nascondi' : 'Mostra' }}
                </button>
              </div>

              <transition name="fade">
                <div v-if="mostraBollette" class="px-1 pb-2">
                  <div v-if="bolletteLoading" class="py-4 text-center text-sm text-zinc-500">Caricamento bollette...</div>

                  <div v-else-if="!bollette.length" class="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
                    Nessuna bolletta disponibile per il tuo appartamento.
                  </div>

                  <template v-else>
                    <!-- Filtro per utenza -->
                    <div class="mb-3 flex flex-wrap gap-2 px-1">
                      <button
                        v-for="u in filtriUtenza"
                        :key="u.valore"
                        @click="filtroUtenzaAttivo = u.valore"
                        class="rounded-full px-3 py-1 text-xs font-semibold transition"
                        :class="filtroUtenzaAttivo === u.valore ? 'bg-[#9a1528] text-white' : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-100'"
                      >
                        {{ u.etichetta }}
                      </button>
                    </div>

                    <!-- Lista bollette filtrate -->
                    <ul class="mb-5 space-y-2">
                      <li
                        v-for="b in bolletteFiltrate"
                        :key="b._id"
                        class="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                      >
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="rounded-full px-2 py-0.5 text-xs font-semibold text-white" :class="coloreUtenzaInq(b.utenza)">
                              {{ capitalizeFirst(b.utenza) }}
                            </span>
                            <span class="font-semibold text-zinc-900">€ {{ Number(b.importo).toFixed(2) }}</span>
                            <span v-if="b.pagata" class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pagata</span>
                            <span v-else class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Da pagare</span>
                          </div>
                          <p class="mt-1 text-xs text-zinc-500">
                            {{ formatoDataBreve(b.periodoInizio) }} — {{ formatoDataBreve(b.periodoFine) }}
                          </p>
                        </div>
                        <a
                          v-if="b.pdfNomeFile"
                          :href="`/api/v1/bollette/${b._id}/pdf`"
                          target="_blank"
                          class="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          PDF
                        </a>
                      </li>
                    </ul>

                    <!-- Grafico consumi: importo per periodo -->
                    <div v-if="datiGraficoBollette.labels.length" class="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Andamento consumi</p>
                      <Bar :data="datiGraficoBollette" :options="opzioniGraficoBollette" />
                    </div>
                  </template>
                </div>
              </transition>
            </div>
          </div>

          <!-- Sezione segnalazioni estesa: occupa tutta la larghezza della card -->
          <div class="px-6 sm:px-8 mb-4">
            <div v-if="guastiAttivi.length" class="mt-2 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
            <div class="mb-2 flex items-center justify-between gap-3 px-4">
              <p class="flex h-7 items-center text-xs font-semibold uppercase leading-none tracking-[0.2em] text-zinc-500">
                Segnalazioni attive
              </p>
              <button
                type="button"
                class="flex h-7 items-center text-xs font-semibold leading-none text-primary transition hover:text-primary-dark hover:underline"
                @click="mostraGuasti = !mostraGuasti"
              >
                {{ mostraGuasti ? 'Nascondi' : 'Mostra' }}
              </button>
            </div>
            <transition name="fade">
              <ul v-if="mostraGuasti" class="space-y-3">
                <li v-for="g in guastiAttivi" :key="g._id" class="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <!-- Sinistra: dati identificativi -->
                  <div class="flex-1">
                    <div>
                      <strong :class="getPriorityColor(g.priorita || g.priorità || 'media')">
                        {{ (g.priorita || g.priorità || 'media').toUpperCase() }}
                      </strong>
                      <span class="text-zinc-700">: {{ g.categoria || 'Altro' }}</span>
                    </div>
                    <p class="mt-2 text-sm text-zinc-700">{{ g.descrizione }}</p>
                    <div v-if="g.stato" class="mt-2 text-xs text-zinc-500">Stato: <strong>{{ capitalizeFirst(g.stato) }}</strong></div>
                  </div>

                  <!-- Destra: date impilate e pulsante sotto -->
                  <div class="flex flex-col items-end gap-3 lg:min-w-[180px]">
                    <div class="text-xs text-zinc-500 text-right">
                      <div v-if="g.createdAt || g.dataSegnalazione">
                        <span class="font-semibold">Segnalato: {{ new Date(g.createdAt || g.dataSegnalazione).toLocaleDateString('it-IT') }}</span>
                        
                      </div>
                      <div v-if="g.dataPresoInCarico" class="mt-2">
                        <span class="font-semibold">Preso in carico: {{ new Date(g.dataPresoInCarico).toLocaleDateString('it-IT') }}</span>

                      </div>
                      <div v-if="g.dataSistemazione" class="mt-2">
                        <span class="font-semibold">Risolto: {{ new Date(g.dataSistemazione).toLocaleDateString('it-IT') }}</span>
                      </div>
                    </div>

                    <div>
                      <button
                        v-if="g.stato === 'preso in carico'"
                        @click="confermaRisoluzione(g)"
                        class="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        Guasto risolto
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </transition>
            </div>
          </div>
        </div>

        <div v-else-if="contrattoAttivo && vistaAttiva === 'calendario'" class="w-full rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div class="flex flex-col gap-6 p-6 sm:p-8">
            <div class="flex flex-col gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Gestione interna</p>
                <h2 class="mt-2 text-2xl font-display text-zinc-900">Calendario condiviso</h2>
                <p class="mt-2 max-w-2xl text-sm text-zinc-600">
                  I rifiuti urbani sono visibili a tutti nel calendario. Le faccende si gestiscono nel turno della settimana, con attività base e attività aggiunte dai membri.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
                @click="vistaAttiva = 'info'"
              >
                Torna ai dettagli contratto
              </button>
            </div>

            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Mese corrente</p>
                    <h3 class="mt-1 text-xl font-display text-zinc-900">{{ titoloCalendario }}</h3>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                    <button
                      type="button"
                      class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900 transition hover:bg-emerald-100"
                      @click="apriCalendarioRifiuti"
                    >
                      Visualizza calendario rifiuti urbani
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 transition"
                      :class="filtroTurniAttivo ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200' : 'bg-white text-zinc-500 hover:text-zinc-700'"
                      @click="toggleFiltro('turni')"
                    >
                      Turni faccende
                    </button>
                    <button
                      type="button"
                      class="rounded-full px-3 py-2 transition"
                      :class="filtroRifiutiAttivo ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200' : 'bg-white text-zinc-500 hover:text-zinc-700'"
                      @click="toggleFiltro('rifiuti')"
                    >
                      Mostra rifiuti
                    </button>
                  </div>
                </div>

                  <div v-if="settimanaInCorso && filtroTurniAttivo" class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-amber-900">Turni della settimana</p>
                        <p class="mt-1 text-sm text-amber-950">{{ settimanaInCorso.periodo }}</p>
                      </div>
                      <span class="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900 shadow-sm">
                        {{ settimanaInCorso.turni.filter((turno) => !turno.completato).length }} attività da svolgere
                      </span>
                    </div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        v-for="turno in settimanaInCorso.turni.slice(0, 4)"
                        :key="turno.id"
                        class="rounded-full px-3 py-2 text-[11px] font-semibold"
                        :class="turno.completato ? 'bg-green-100 text-green-900 line-through' : 'bg-white text-zinc-800'"
                      >
                        {{ turno.titolo }}
                      </span>
                    </div>
                  </div>

                <div class="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  <div v-for="giorno in giorniSettimana" :key="giorno" class="py-2">{{ giorno }}</div>
                </div>

                <div class="mt-2 grid grid-cols-7 gap-2">
                  <div
                    v-for="celle in celleCalendario"
                    :key="celle.key"
                    class="min-h-[128px] rounded-2xl border p-3 transition"
                    :class="celle.inMese
                      ? (isCurrentWeekCell(celle.giorno) ? 'border-amber-200 bg-amber-50 hover:border-amber-300' : 'border-zinc-200 bg-white hover:border-primary/40')
                      : 'border-dashed border-zinc-200 bg-zinc-100 text-zinc-400'"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-sm font-semibold" :class="celle.oggi ? 'text-primary' : 'text-zinc-900'">
                        {{ celle.giorno }}
                      </span>
                      <span v-if="celle.oggi" class="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Oggi</span>
                    </div>

                    <div
                      v-if="filtroTurniAttivo && isCurrentWeekCell(celle.giorno) && !settimanaInCorsoCompletata"
                      class="mt-2 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900"
                    >
                      Turno
                    </div>

                    <div v-if="filtroRifiutiAttivo" class="mt-3 space-y-2">
                      <div
                        v-for="evento in celle.rifiuti"
                        :key="evento.label + celle.key"
                        class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-950"
                      >
                        <div class="font-semibold">Rifiuti urbani</div>
                        <div class="text-[11px] font-medium opacity-80">{{ evento.dettaglio }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside class="space-y-4">
                <div class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Turni settimana corrente</p>
                  <div class="mt-4 space-y-3">
                    <article v-if="settimanaInCorso" class="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-zinc-900">Turni della settimana</p>
                          <p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{{ settimanaInCorso.periodo }}</p>
                        </div>
                        <span class="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" :class="settimanaInCorsoCompletata ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'">
                          {{ settimanaInCorsoCompletata ? 'Completata' : 'In corso' }}
                        </span>
                      </div>

                      <div class="mt-3 space-y-2">
                        <div
                          v-for="turno in settimanaInCorso.turni"
                          :key="turno.id"
                          class="flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2 transition"
                          :class="turno.completato ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-white hover:border-primary/30'"
                        >
                          <input
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                            :checked="turno.completato"
                            @click.stop
                            @change="toggleTurnoCompletato(turno)"
                          />
                          <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                              <p class="text-sm font-semibold text-zinc-900" :class="turno.completato ? 'line-through text-zinc-500' : ''">
                                {{ turno.titolo }}
                              </p>
                              <span class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" :class="turno.visibilita === 'condivisa' ? 'bg-sky-100 text-sky-900' : 'bg-violet-100 text-violet-900'">
                                {{ turno.visibilita === 'condivisa' ? 'Condivisa' : 'Privata' }}
                              </span>
                            </div>
                          </div>
                          <!-- Elimina: disponibile solo sulle faccende create dall'utente -->
                          <button
                            v-if="turno.isMia"
                            type="button"
                            class="mt-0.5 rounded-full px-2 py-1 text-[11px] font-semibold text-zinc-400 transition hover:text-primary"
                            @click.stop="eliminaFaccendaCorrente(turno)"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>

                      <p v-if="faccendeError" class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {{ faccendeError }}
                      </p>
                    </article>

                    <button
                      type="button"
                      class="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      @click="toggleMostraSettimanaProssima"
                    >
                      {{ mostraSettimanaProssima ? 'Nascondi turni settimana prossima' : 'Mostra turni settimana prossima' }}
                    </button>

                    <transition name="fade">
                      <article v-if="mostraSettimanaProssima && settimanaSuccessiva" class="rounded-2xl border border-zinc-100 bg-zinc-50 p-4" :class="isSettimanaProssimaAttiva() ? '' : 'opacity-60'">
                        <div class="flex items-start justify-between gap-3">
                          <div>
                            <p class="text-sm font-semibold text-zinc-900">Settimana prossima</p>
                            <p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{{ settimanaSuccessiva.periodo }}</p>
                          </div>
                          <span class="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" :class="isSettimanaProssimaAttiva() ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-200 text-zinc-700'">
                            {{ isSettimanaProssimaAttiva() ? 'Aperta' : 'Bloccata' }}
                          </span>
                        </div>

                        <div class="mt-3 space-y-2" :class="isSettimanaProssimaAttiva() ? '' : 'pointer-events-none'">
                          <div
                            v-for="turno in settimanaSuccessiva.turni"
                            :key="turno.id"
                            class="flex items-start gap-3 rounded-2xl border px-3 py-2 transition"
                            :class="isSettimanaProssimaAttiva()
                              ? (turno.completato ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-white hover:border-primary/30')
                              : 'border-zinc-200 bg-zinc-100 text-zinc-500'"
                          >
                            <input
                              type="checkbox"
                              class="mt-1 h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                              :checked="turno.completato"
                              :disabled="!isSettimanaProssimaAttiva()"
                              @click.stop
                              @change="isSettimanaProssimaAttiva() && toggleTurnoCompletato(turno)"
                            />
                            <div class="min-w-0 flex-1">
                              <div class="flex flex-wrap items-center gap-2">
                                <p class="text-sm font-semibold text-zinc-900" :class="turno.completato ? 'line-through text-zinc-500' : ''">
                                  {{ turno.titolo }}
                                </p>
                                <span class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" :class="turno.visibilita === 'condivisa' ? 'bg-sky-100 text-sky-900' : 'bg-violet-100 text-violet-900'">
                                  {{ turno.visibilita === 'condivisa' ? 'Condivisa' : 'Privata' }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </transition>
                  </div>
                </div>

                <div class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Aggiungi faccenda</p>
                  <form class="mt-4 space-y-3" @submit.prevent="aggiungiFaccenda">
                    <input
                      v-model.trim="nuovaFaccendaTitolo"
                      type="text"
                      class="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary"
                      placeholder="Es. Pulizia balcone"
                    />
                    <div class="grid gap-3 sm:grid-cols-2">
                      <select
                        v-model="nuovaFaccendaVisibilita"
                        class="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-primary"
                      >
                        <option value="privata">Privata</option>
                        <option value="condivisa">Condivisa</option>
                      </select>

                      <button
                        type="submit"
                        class="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                      >
                        Aggiungi
                      </button>
                    </div>
                    <p class="text-xs text-zinc-500">
                      La faccenda verrà aggiunta al turno della settimana corrente e resterà visibile secondo la sua impostazione.
                    </p>
                  </form>
                </div>

                <div class="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Legenda</p>
                  <div class="mt-4 space-y-3 text-sm text-zinc-700">
                    <div class="flex items-center gap-3">
                      <span class="h-3 w-3 rounded-full bg-amber-400"></span>
                      <span>Turni della settimana</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span>Passaggio del servizio urbano dei rifiuti</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <div v-else class="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center text-zinc-600 shadow-sm">
          Non hai un contratto attivo al momento. Puoi consultare solo i contratti passati.
        </div>

        <div v-if="contrattiPassati.length && vistaAttiva !== 'calendario'" class="w-full">
          <div class="mb-4 text-center">
            <button
              type="button"
              class="text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline"
              @click="mostraPassati = !mostraPassati"
            >
              {{ mostraPassati ? 'Nascondi contratti passati' : 'Mostra contratti passati' }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="mostraPassati" class="grid gap-4">
              <article
                v-for="contratto in contrattiPassati"
                :key="contratto._id"
                class="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center"
              >
                <div class="flex-1">
                  <p class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Contratto passato</p>
                  <h3 class="mt-2 text-lg font-semibold text-zinc-900">
                    {{ indirizzoCompleto(contratto.idAppartamento) }}
                  </h3>
                  <p class="mt-1 text-sm text-zinc-600">
                    {{ formattaPeriodo(contratto.dataInizio, contratto.dataFine) }}
                  </p>
                  <p class="mt-2 text-sm text-zinc-700">
                    Canone mensile: <strong>€ {{ contratto.canoneMensile }}</strong>
                  </p>
                </div>
                <div class="flex flex-shrink-0 items-center lg:w-40">
                  <button
                    type="button"
                    class="flex w-full items-center justify-center rounded-full bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-300"
                  >
                    Lascia una recensione
                  </button>
                </div>
              </article>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </main>

  <GuastoForm
    v-if="showGuastoForm"
    :apartment="appartamentoAttivo"
    @saved="onGuastoSaved"
    @close="closeGuastoForm"
  />

  <!-- Modal: Lista spesa del contratto attivo -->
  <transition name="fade">
    <div v-if="showListaSpesa" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="showListaSpesa = false"></div>
      <div class="relative mx-4 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a1528]">Spesa coinquilini</p>
          <h2 class="mt-1 text-2xl font-bold text-zinc-900">Gestisci la spesa condivisa</h2>
          </div>
        
            <button
                type="button"
                @click="showListaSpesa = false"
                class="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Chiudi"
            >  
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>     
        </div>

        <div class="mt-4 rounded-2xl border border-primary bg-zinc-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                v-model.trim="nuovoElementoSpesa"
                type="text"
                class="w-full flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary"
                placeholder="Aggiungi un prodotto e premi invio"
                @keydown.enter.prevent="aggiungiElementoListaSpesa"
              />
              <input
                v-model.number="nuovoElementoQuantita"
                type="number"
                min="1"
                class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary sm:w-28"
                @keydown.enter.prevent="aggiungiElementoListaSpesa"
                />
            </div>        
          </div>

        <div class="mt-5 max-h-[58vh] overflow-auto pr-1">
          <div v-if="listaSpesaBozza.length" class="space-y-3 pb-4">
            <article
                v-for="(item, idx) in listaSpesaBozza"
                :key="item.key"
                class="rounded-2xl border p-4 shadow-sm transition"
                :class="item.preso
                    ? 'border-green-200 bg-green-50'
                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'"
                >
                <div class="flex items-center gap-4">
                    <div class="min-w-0 flex-1">
                    <p
                        class="truncate text-base font-semibold transition"
                        :class="item.preso ? 'line-through text-zinc-400' : 'text-zinc-900'"
                    >{{ capitalizeFirst(item.nome) }}</p>
                    </div>

                <div class="flex items-center gap-3">
                    <span :class="item.preso ? 'line-through text-zinc-400' : 'whitespace-nowrap'">Qta:</span>
                    <input
                      type="number"
                      min="1"
                      :class=" item.preso ? 'line-through w-8 border-0 bg-transparent p-0 text-sm font-semibold text-zinc-400 outline-none focus:ring-0' : 'w-8 border-0 bg-transparent p-0 text-sm font-semibold text-zinc-800 outline-none focus:ring-0'"
                      :value="item.quantita"
                      @input="aggiornaQuantitaListaSpesa(idx, $event)"
                    />

                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                      :checked="item.preso"
                      @change="toggleListaSpesaPreso(idx, $event)"
                    />
                </div>
              </div>
            </article>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600">
            Nessun elemento nella lista spesa per questo contratto.
          </div>

          
        </div>

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4">
          <button
            type="button"
            @click="showListaSpesa = false"
            class="rounded-full border border-zinc-300 px-5 py-2.5 font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Annulla
          </button>
          <button type="button" 
            @click="salvaListaSpesa"
            class="rounded-full bg-[#9a1528] px-5 py-2.5 font-semibold text-white hover:bg-[#7f1020]">
            Salva
  <div
    v-if="showCalendarioRifiutiModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 px-4 py-8 backdrop-blur-sm"
  >
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div class="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Rifiuti urbani</p>
          <h3 class="mt-2 text-xl font-display text-zinc-900">{{ indirizzoCompleto(appartamentoAttivo) }}</h3>
          <p class="mt-2 text-sm text-zinc-600">
            I giorni di raccolta sono condivisi tra tutti i coinquilini del contratto attivo.
          </p>
        </div>

        <button
          type="button"
          class="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:border-primary hover:text-primary"
          @click="chiudiCalendarioRifiuti"
        >
          Chiudi
        </button>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
        <div
          v-for="voce in calendarioRifiutiDaMostrare"
          :key="voce.tipo"
          class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-zinc-900">{{ voce.tipo }}</p>
              <p class="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                {{ mostraGiorniRifiuti(voce.giorni) }}
              </p>
            </div>
            <span class="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 shadow-sm">
              {{ voce.giorni.length ? 'Attivo' : 'Non impostato' }}
            </span>
          </div>

          <div v-if="isEditingCalendarioRifiuti" class="mt-3 flex flex-wrap gap-2">
            <label
              v-for="giorno in giorniSelezionabili"
              :key="`${voce.tipo}-${giorno.value}`"
              class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition"
              :class="isGiornoSelezionatoBozza(voce.tipo, giorno.value)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-primary/40'"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
                :checked="isGiornoSelezionatoBozza(voce.tipo, giorno.value)"
                @change="toggleGiornoCalendarioBozza(voce.tipo, giorno.value)"
              />
              <span>{{ giorno.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="calendarioRifiutiError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ calendarioRifiutiError }}
        </div>

        <div v-if="calendarioRifiutiSuccess" class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {{ calendarioRifiutiSuccess }}
        </div>
      </div>

      <div class="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4 sm:px-6">
        <p class="text-xs text-zinc-500">
          {{ isEditingCalendarioRifiuti ? 'Seleziona i giorni di raccolta per ciascuna tipologia.' : 'Premi Modifica per aggiornare i giorni di raccolta.' }}
        </p>

        <div class="flex items-center gap-3">
          <button
            v-if="isEditingCalendarioRifiuti"
            type="button"
            class="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-primary hover:text-primary"
            @click="annullaModificaCalendarioRifiuti"
          >
            Annulla
          </button>

          <button
            type="button"
            class="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition"
            :class="salvataggioCalendarioRifiuti ? 'cursor-wait bg-zinc-400' : 'bg-primary hover:bg-primary-dark'"
            :disabled="salvataggioCalendarioRifiuti"
            @click="isEditingCalendarioRifiuti ? salvaCalendarioRifiuti() : entraInModificaCalendarioRifiuti()"
          >
            {{ isEditingCalendarioRifiuti ? 'Salva modifiche' : 'Modifica' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
  </div>
</AppLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { getContrattiUtenteLoggato, getCalendarioRifiutiAppartamento, aggiornaCalendarioRifiutiAppartamento, getGuastiAppartamento, risolviGuasto, getFaccendeAppartamento, aggiungiFaccendaAppartamento, aggiornaFaccendaAppartamento, eliminaFaccendaAppartamento, aggiornaListaSpesa } from '../services/gestioneInternaService'
import { getBolletteInquilino } from '../services/bolletteService'
import GuastoForm from '@/components/GuastoForm.vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const contratti = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const mostraPassati = ref(false)
const mostraGuasti = ref(false)
const showGuastoForm = ref(false)
const guastiAttivi = ref([])
const successMessage = ref('')
const vistaAttiva = ref('info')
const mostraSettimanaProssima = ref(false)
const nuovaFaccendaTitolo = ref('')
const nuovaFaccendaVisibilita = ref('privata')
const filtroTurniAttivo = ref(true)
const filtroRifiutiAttivo = ref(true)
const showCalendarioRifiutiModal = ref(false)
const isEditingCalendarioRifiuti = ref(false)
const salvataggioCalendarioRifiuti = ref(false)
const calendarioRifiutiError = ref('')
const calendarioRifiutiSuccess = ref('')
const calendarioRifiuti = ref(creaCalendarioRifiutiDefault())
const bozzaCalendarioRifiuti = ref(creaCalendarioRifiutiDefault())

const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const giorniSelezionabili = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Gio' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
]
const dataCalendario = new Date()
const meseCorrente = dataCalendario.getMonth()
const annoCorrente = dataCalendario.getFullYear()
const dataOggiISO = oggiISO()
const tipiRifiuti = ['Organico', 'Carta', 'Imballaggi leggeri', 'Residuo', 'Vetro']

const templateTurni = {
  1: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Pulizia pavimenti zone comuni' },
  2: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Organico' },
  3: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Pulizia cucina' },
  4: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Carta e cartone' },
  5: { tipo: 'faccende', label: 'Turno casa', dettaglio: 'Pulizia bagno' },
  6: { tipo: 'rifiuti', label: 'Rifiuti urbani', dettaglio: 'Plastica e vetro' },
}

// Faccende reali del contratto attivo, caricate dal backend (US23).
const faccende = ref([])
const faccendeError = ref('')

const titoloCalendario = computed(() =>
  new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(annoCorrente, meseCorrente, 1)),
)

const celleCalendario = computed(() => {
  const primoGiorno = new Date(annoCorrente, meseCorrente, 1)
  const ultimoGiorno = new Date(annoCorrente, meseCorrente + 1, 0)
  const offset = (primoGiorno.getDay() + 6) % 7
  const giorniNelMese = ultimoGiorno.getDate()
  const totaleCelle = Math.ceil((offset + giorniNelMese) / 7) * 7

  return Array.from({ length: totaleCelle }, (_, index) => {
    const giornoDelMese = index - offset + 1
    const inMese = giornoDelMese >= 1 && giornoDelMese <= giorniNelMese
    const data = inMese ? new Date(annoCorrente, meseCorrente, giornoDelMese) : null
    const giornoSettimana = data ? data.getDay() : null
    const rifiutiDelGiorno = giornoSettimana !== null
      ? calendarioRifiuti.value
        .filter((voce) => Array.isArray(voce.giorni) && voce.giorni.includes(giornoSettimana))
        .map((voce) => ({
          key: `${annoCorrente}-${meseCorrente}-${giornoDelMese}-${voce.tipo}`,
          tipo: voce.tipo,
          dettaglio: voce.tipo,
        }))
      : []

    return {
      key: `${annoCorrente}-${meseCorrente}-${index}`,
      giorno: inMese ? giornoDelMese : '',
      inMese,
      oggi: inMese && data.toISOString().slice(0, 10) === dataOggiISO,
      rifiuti: filtroRifiutiAttivo.value ? rifiutiDelGiorno : [],
    }
  })
})

function creaSettimana(offsetSettimane, isCurrent = false) {
  const dataBase = new Date()
  dataBase.setDate(dataBase.getDate() + offsetSettimane * 7)
  const inizio = new Date(dataBase)
  inizio.setDate(dataBase.getDate() - ((dataBase.getDay() + 6) % 7))
  const fine = new Date(inizio)
  fine.setDate(inizio.getDate() + 6)
  const settimanaKey = inizio.toISOString().slice(0, 10)

  // Tutti i turni provengono dalle faccende reali del contratto (persistite sul backend):
  // le condivise sono visibili a tutti gli inquilini, le private solo al creatore.
  const turni = faccende.value.map((faccenda) => ({
    id: `${settimanaKey}-${faccenda._id}`,
    faccendaId: faccenda._id,
    titolo: faccenda.titolo,
    descrizione: faccenda.descrizione,
    visibilita: faccenda.visibilita,
    completato: Boolean(faccenda.completato),
    isMia: Boolean(faccenda.isMia),
  }))

  return {
    key: `settimana-${offsetSettimane}`,
    isCurrent,
    periodo: `${formattaDataBreve(inizio)} - ${formattaDataBreve(fine)}`,
    turni,
  }
}

const settimaneProssime = ref([])

function rigeneraSettimane() {
  settimaneProssime.value = [creaSettimana(0, true), creaSettimana(1, false)]
}

const settimanaInCorso = computed(() => settimaneProssime.value[0] || null)
const settimanaSuccessiva = computed(() => settimaneProssime.value[1] || null)
const settimanaInCorsoCompletata = computed(() => Boolean(settimanaInCorso.value?.turni.length) && settimanaInCorso.value.turni.every((turno) => turno.completato))

const elencoFaccendeCondivise = computed(() =>
  faccende.value
    .filter((faccenda) => faccenda.visibilita === 'condivisa')
    .slice(0, 3),
)

const eventiProssimi = computed(() => {
  const settimana = settimaneProssime.value[0]
  return settimana ? settimana.turni.slice(0, 5) : []
})

const contrattoAttivo = computed(() => contratti.value.find((contratto) => contratto.stato === 'attivo') || null)
const contrattiPassati = computed(() => contratti.value.filter((contratto) => contratto.stato !== 'attivo'))
const appartamentoAttivo = computed(() => contrattoAttivo.value?.idAppartamento || null)
const calendarioRifiutiDaMostrare = computed(() => (isEditingCalendarioRifiuti.value ? bozzaCalendarioRifiuti.value : calendarioRifiuti.value))

// Modal lista spesa
const showListaSpesa = ref(false)

const listaSpesaBozza = ref([])

const nuovoElementoSpesa = ref('')
const nuovoElementoQuantita = ref(1)
const listaSpesaSaving = ref(false)
const listaSpesaError = ref('')

function normalizeListaSpesaItem(item, index = 0) {
  if (typeof item === 'string') {
    return {
      key: `spesa-${index}-${item}`,
      nome: item,
      quantita: 1,
      preso: false,
    }
  }

  return {
    key: item?.key || `spesa-${index}-${item?.nome || 'elemento'}`,
    nome: item?.nome || 'Elemento senza nome',
    quantita: Number(item?.quantita) > 0 ? Number(item.quantita) : 1,
    preso: Boolean(item?.preso),
  }
}

function getListaSpesaSource() {
  return Array.isArray(contrattoAttivo.value?.listaSpesa) ? contrattoAttivo.value.listaSpesa : []
}

function sincronizzaListaSpesaBozza() {
  listaSpesaBozza.value = getListaSpesaSource().map((item, index) => normalizeListaSpesaItem(item, index))
}

function preparaListaSpesaPerApi() {
  return listaSpesaBozza.value
    .filter((item) => !item.preso)
    .map((item) => ({
      nome: item.nome,
      quantita: Number(item.quantita) > 0 ? Number(item.quantita) : 1,
      preso: false,
    }))
}

function chiudiListaSpesa() {
  showListaSpesa.value = false
  listaSpesaError.value = ''
  nuovoElementoSpesa.value = ''
  nuovoElementoQuantita.value = 1
}

function oggiISO() {
  return new Date().toISOString().slice(0, 10)
}

// ── Stato bollette inquilino ──────────────────────────────────────────────────
const bollette = ref([])
const bolletteLoading = ref(false)
const mostraBollette = ref(false)
const filtroUtenzaAttivo = ref('tutti')

const filtriUtenza = [
  { valore: 'tutti', etichetta: 'Tutte' },
  { valore: 'luce', etichetta: 'Luce' },
  { valore: 'gas', etichetta: 'Gas' },
  { valore: 'acqua', etichetta: 'Acqua' },
]

const graficiBollette = ref(null)

const bolletteFiltrate = computed(() => {
  if (filtroUtenzaAttivo.value === 'tutti') return bollette.value
  return bollette.value.filter((b) => b.utenza === filtroUtenzaAttivo.value)
})

const datiGraficoBollette = computed(() => {
  // Usa i dati grafici precalcolati dal backend, filtrati per utenza se necessario
  if (!graficiBollette.value) return { labels: [], datasets: [] }
  if (filtroUtenzaAttivo.value === 'tutti') return graficiBollette.value
  return {
    labels: graficiBollette.value.labels,
    datasets: graficiBollette.value.datasets.filter(
      (ds) => ds.label.toLowerCase() === filtroUtenzaAttivo.value
    ),
  }
})

const opzioniGraficoBollette = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: { label: (ctx) => ` € ${Number(ctx.raw).toFixed(2)}` },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => `€ ${v}` },
    },
  },
}

function coloreUtenzaInq(utenza) {
  const mappa = { luce: 'bg-amber-500', gas: 'bg-blue-500', acqua: 'bg-cyan-500' }
  return mappa[utenza] || 'bg-zinc-500'
}

function formatoDataBreve(dateValue) {
  if (!dateValue) return '—'
  return new Date(dateValue).toLocaleDateString('it-IT')
}

async function caricaBollette() {
  bolletteLoading.value = true
  const res = await getBolletteInquilino()
  if (res.success) {
    bollette.value = res.data?.data || []
    graficiBollette.value = res.data?.grafici || null
  }
  bolletteLoading.value = false
}

watch([showGuastoForm, showCalendarioRifiutiModal], ([openGuasto, openCalendario]) => {
  document.body.style.overflow = openGuasto || openCalendario ? 'hidden' : ''
})

watch(
  () => [showGuastoForm.value, showListaSpesa.value],
  ([guastoOpen, spesaOpen]) => {
    document.body.style.overflow = guastoOpen || spesaOpen ? 'hidden' : ''
  },
  { immediate: true },
)
function creaCalendarioRifiutiDefault() {
  return [
    { tipo: 'Organico', giorni: [1, 4] },
    { tipo: 'Carta', giorni: [2] },
    { tipo: 'Imballaggi leggeri', giorni: [3] },
    { tipo: 'Residuo', giorni: [5] },
    { tipo: 'Vetro', giorni: [6] },
  ]
}

function normalizzaCalendarioRifiuti(valore) {
  const source = Array.isArray(valore) ? valore : creaCalendarioRifiutiDefault()
  const mappa = new Map()

  source.forEach((voce) => {
    if (!voce || !tipiRifiuti.includes(voce.tipo)) return

    const giorni = Array.isArray(voce.giorni)
      ? [...new Set(voce.giorni.map((giorno) => Number.parseInt(giorno, 10)).filter((giorno) => Number.isInteger(giorno) && giorno >= 0 && giorno <= 6))].sort((a, b) => a - b)
      : []

    mappa.set(voce.tipo, giorni)
  })

  return tipiRifiuti.map((tipo) => ({
    tipo,
    giorni: mappa.has(tipo) ? mappa.get(tipo) : [],
  }))
}

function copiaCalendarioRifiuti(valore) {
  return normalizzaCalendarioRifiuti(valore).map((voce) => ({
    tipo: voce.tipo,
    giorni: [...voce.giorni],
  }))
}

function getAppartamentoId(appartamento) {
  return appartamento?._id || appartamento?.id || ''
}

function getVoceCalendarioRifiuti(tipo, source = calendarioRifiuti.value) {
  return (source || []).find((voce) => voce.tipo === tipo) || { tipo, giorni: [] }
}

function mostraGiorniRifiuti(giorni) {
  if (!Array.isArray(giorni) || giorni.length === 0) {
    return 'Nessun giorno impostato'
  }

  return giorniSelezionabili.filter((giorno) => giorni.includes(giorno.value)).map((giorno) => giorno.label).join(', ')
}

function isGiornoSelezionatoBozza(tipo, giorno) {
  const voce = getVoceCalendarioRifiuti(tipo, bozzaCalendarioRifiuti.value)
  return Array.isArray(voce.giorni) && voce.giorni.includes(giorno)
}

function toggleGiornoCalendarioBozza(tipo, giorno) {
  const prossimo = copiaCalendarioRifiuti(bozzaCalendarioRifiuti.value)
  const voce = prossimo.find((elemento) => elemento.tipo === tipo)
  if (!voce) return

  if (voce.giorni.includes(giorno)) {
    voce.giorni = voce.giorni.filter((valore) => valore !== giorno)
  } else {
    voce.giorni = [...voce.giorni, giorno].sort((a, b) => a - b)
  }

  bozzaCalendarioRifiuti.value = prossimo
}

async function loadCalendarioRifiuti() {
  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId) {
    calendarioRifiuti.value = creaCalendarioRifiutiDefault()
    bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
    return
  }

  const response = await getCalendarioRifiutiAppartamento(appId)
  if (response.success) {
    calendarioRifiuti.value = normalizzaCalendarioRifiuti(response.data?.data)
    bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
    calendarioRifiutiError.value = ''
  } else {
    calendarioRifiuti.value = creaCalendarioRifiutiDefault()
    bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
    calendarioRifiutiError.value = response.error
  }
}

function apriCalendarioRifiuti() {
  calendarioRifiutiError.value = ''
  calendarioRifiutiSuccess.value = ''
  isEditingCalendarioRifiuti.value = false
  bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
  showCalendarioRifiutiModal.value = true
}

function chiudiCalendarioRifiuti() {
  showCalendarioRifiutiModal.value = false
  isEditingCalendarioRifiuti.value = false
  calendarioRifiutiError.value = ''
  calendarioRifiutiSuccess.value = ''
  bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
}

function entraInModificaCalendarioRifiuti() {
  calendarioRifiutiError.value = ''
  calendarioRifiutiSuccess.value = ''
  isEditingCalendarioRifiuti.value = true
  bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
}

function annullaModificaCalendarioRifiuti() {
  isEditingCalendarioRifiuti.value = false
  calendarioRifiutiError.value = ''
  bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
}

async function salvaCalendarioRifiuti() {
  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId) return

  salvataggioCalendarioRifiuti.value = true
  calendarioRifiutiError.value = ''
  calendarioRifiutiSuccess.value = ''

  const response = await aggiornaCalendarioRifiutiAppartamento(appId, bozzaCalendarioRifiuti.value)
  if (response.success) {
    calendarioRifiuti.value = normalizzaCalendarioRifiuti(response.data?.data)
    bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
    isEditingCalendarioRifiuti.value = false
    calendarioRifiutiSuccess.value = 'Rifiuti urbani aggiornati correttamente.'
    setTimeout(() => {
      calendarioRifiutiSuccess.value = ''
    }, 3000)
  } else {
    calendarioRifiutiError.value = response.error
  }

  salvataggioCalendarioRifiuti.value = false
}

function azionePlaceholder(tipo) {
  const etichette = {
    spesa: 'Lista spesa',
    consumi: 'Consumi',
  }

  successMessage.value = `${etichette[tipo] || 'Funzione'} non ancora disponibile.`
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function indirizzoCompleto(appartamento) {
  if (!appartamento?.indirizzo) return 'Indirizzo non disponibile'
  const { via, numero, città } = appartamento.indirizzo
  return `${via || 'Via sconosciuta'} ${numero || ''}${città ? `, ${città}` : ''}`.trim()
}

function formattaPeriodo(inizio, fine) {
  const start = inizio ? new Date(inizio).toLocaleDateString('it-IT') : '—'
  const end = fine ? new Date(fine).toLocaleDateString('it-IT') : '—'
  return `${start} — ${end}`
}

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
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
  const now = new Date()
  const diffDays = (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function shouldShowGuasto(guasto) {
  if (!guasto) return false
  if (guasto.stato === 'segnalato' || guasto.stato === 'preso in carico') return true
  return isRecentResolved(guasto)
}

function filtraGuastiVisibili(lista) {
  return (Array.isArray(lista) ? lista : []).filter(shouldShowGuasto)
}

function vaiAGuasti() {
  if (!appartamentoAttivo.value) return
  showGuastoForm.value = true
}

async function apriCalendarioCondiviso() {
  vistaAttiva.value = 'calendario'
  mostraSettimanaProssima.value = false
  await loadFaccende()
  rigeneraSettimane()
}

function azionePlaceholder(tipo) {
  if (tipo === 'spesa') {
    listaSpesaError.value = ''
    sincronizzaListaSpesaBozza()
    showListaSpesa.value = true
    return
  }

  // per gli altri tipi lasciare comportamento placeholder
  console.log('Azione non implementata:', tipo)
}

function aggiungiElementoListaSpesa() {
  const nome = nuovoElementoSpesa.value.trim()
  if (!nome) return

  listaSpesaBozza.value.push({
    key: `spesa-${Date.now()}`,
    nome,
    quantita: Number(nuovoElementoQuantita.value) > 0 ? Number(nuovoElementoQuantita.value) : 1,
    preso: false,
  })

  nuovoElementoSpesa.value = ''
  nuovoElementoQuantita.value = 1
}

function toggleListaSpesaPreso(index, event) {
  const item = listaSpesaBozza.value[index]
  if (!item) return

  item.preso = Boolean(event?.target?.checked)
}

function aggiornaQuantitaListaSpesa(index, event) {
  const value = Number(event?.target?.value)
  const quantita = Number.isFinite(value) && value > 0 ? value : 1
  const item = listaSpesaBozza.value[index]
  if (!item) return

  item.quantita = quantita
}

async function salvaListaSpesa() {
  const contratto = contrattoAttivo.value
  if (!contratto?._id) {
    listaSpesaError.value = 'Nessun contratto attivo disponibile.'
    return
  }

  listaSpesaSaving.value = true
  listaSpesaError.value = ''

  const payload = preparaListaSpesaPerApi()
  const response = await aggiornaListaSpesa(contratto._id, payload)

  if (response.success) {
    const listaSalvata = Array.isArray(response.data?.data) ? response.data.data : payload
    contratto.listaSpesa = listaSalvata
      .map((item, index) => normalizeListaSpesaItem(item, index))
      .map((item) => ({ nome: capitalizeFirst(item.nome), quantita: item.quantita, preso: item.preso }))

    sincronizzaListaSpesaBozza()
    listaSpesaSaving.value = false
    chiudiListaSpesa()
    successMessage.value = 'Lista spesa aggiornata con successo.'
    setTimeout(() => (successMessage.value = ''), 3500)
    return
  }

  listaSpesaSaving.value = false
  listaSpesaError.value = response.error || 'Errore durante il salvataggio della lista spesa.'
}

function toggleFiltro(tipo) {
  if (tipo === 'turni') {
    filtroTurniAttivo.value = !filtroTurniAttivo.value
  } else if (tipo === 'rifiuti') {
    filtroRifiutiAttivo.value = !filtroRifiutiAttivo.value
  }
}

function toggleMostraSettimanaProssima() {
  mostraSettimanaProssima.value = !mostraSettimanaProssima.value
}

async function toggleTurnoCompletato(turno) {
  if (!turno) return

  // Ogni turno è una faccenda persistita: aggiorna "completato" sul backend e ricarica.
  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId || !turno.faccendaId) return

  const res = await aggiornaFaccendaAppartamento(appId, turno.faccendaId, { completato: !turno.completato })
  if (res.success) {
    await loadFaccende()
    rigeneraSettimane()
  } else {
    faccendeError.value = res.error
  }
}

function isCurrentWeekCell(giornoDelMese) {
  if (!giornoDelMese) return false

  const data = new Date(annoCorrente, meseCorrente, giornoDelMese)
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return data >= start && data <= end
}

function isSettimanaProssimaAttiva() {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7)
  start.setHours(0, 0, 0, 0)
  return today >= start
}

async function loadFaccende() {
  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId) {
    faccende.value = []
    return
  }

  const res = await getFaccendeAppartamento(appId)
  if (res.success) {
    faccende.value = Array.isArray(res.data?.data) ? res.data.data : []
    faccendeError.value = ''
  } else {
    faccende.value = []
    faccendeError.value = res.error
  }
}

async function aggiungiFaccenda() {
  const titolo = nuovaFaccendaTitolo.value.trim()
  if (!titolo) return

  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId) return

  faccendeError.value = ''
  const res = await aggiungiFaccendaAppartamento(appId, {
    titolo,
    visibilita: nuovaFaccendaVisibilita.value,
  })

  if (res.success) {
    nuovaFaccendaTitolo.value = ''
    nuovaFaccendaVisibilita.value = 'privata'
    await loadFaccende()
    rigeneraSettimane()
  } else {
    faccendeError.value = res.error
  }
}

async function eliminaFaccendaCorrente(turno) {
  const appId = getAppartamentoId(appartamentoAttivo.value)
  if (!appId || !turno?.faccendaId) return

  const res = await eliminaFaccendaAppartamento(appId, turno.faccendaId)
  if (res.success) {
    await loadFaccende()
    rigeneraSettimane()
  } else {
    faccendeError.value = res.error
  }
}

function closeGuastoForm() {
  showGuastoForm.value = false
}

function onGuastoSaved(payload) {
  // payload may contain created guasto
  closeGuastoForm()
  successMessage.value = 'Segnalazione ricevuta — grazie, provvederemo a gestirla.'
  setTimeout(() => (successMessage.value = ''), 4000)
  // ricarica i guasti visibili
  loadGuasti()
}

async function loadGuasti() {
  guastiAttivi.value = []
  const app = appartamentoAttivo.value
  if (!app) return
  const appId = typeof app === 'string' ? app : (app._id || app.id || '')
  if (!appId) return
  const res = await getGuastiAppartamento(appId)
  if (res.success) {
    guastiAttivi.value = filtraGuastiVisibili(res.data?.data || [])
  }
}

async function confermaRisoluzione(guasto) {
  if (!guasto || !guasto._id) return

  try {
    const res = await risolviGuasto(guasto._id)
    if (res.success) {
      successMessage.value = 'Segnalazione marcata come risolta.'
      setTimeout(() => (successMessage.value = ''), 4000)
      await loadGuasti()
    } else {
      console.error('Errore risoluzione:', res.error)
    }
  } catch (err) {
    console.error(err)
  }
}

function formattaDataBreve(data) {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(data))
}

onUnmounted(() => {
  document.body.style.overflow = ''
})

watch(contrattoAttivo, (value) => {
  if (!value) showGuastoForm.value = false
  // quando cambia il contratto attivo, carica i guasti relativi
  if (value) {
    loadGuasti()
    loadCalendarioRifiuti()
    loadFaccende()
    caricaBollette()
  } else {
    calendarioRifiuti.value = creaCalendarioRifiutiDefault()
    bozzaCalendarioRifiuti.value = copiaCalendarioRifiuti(calendarioRifiuti.value)
    faccende.value = []
    bollette.value = []
  }
})

watch(vistaAttiva, (value) => {
  if (value === 'calendario') {
    mostraGuasti.value = false
  }
})

async function caricaContratti() {
  isLoading.value = true
  errorMessage.value = ''

  const response = await getContrattiUtenteLoggato()
  if (response.success) {
    contratti.value = response.data?.contratti ?? []
    // se c'è un contratto attivo, carica guasti e bollette
    if (contratti.value && contratti.value.length) {
      const ca = contratti.value.find((c) => c.stato === 'attivo')
      if (ca) {
        await loadGuasti()
        await loadCalendarioRifiuti()
        await loadFaccende()
        await caricaBollette()
      }
    }
  } else {
    errorMessage.value = response.error
  }

  isLoading.value = false
}

onMounted(caricaContratti)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>