<template>
	<!-- Tre riquadri che presentano le funzioni base della piattaforma. -->
  <section id="features" class="border-y border-zinc-200 bg-white">
    <div class="mx-auto max-w-[1200px] px-6 py-4 lg:px-8">
      <div class="grid gap-0 md:grid-cols-3 md:border-l md:border-r md:border-zinc-200">
        <article class="flex min-h-[18rem] flex-col justify-between border-b border-zinc-200 p-8 md:border-b-0 md:border-r md:last:border-r-0">
          <div class="space-y-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9a1528]/10 text-[#9a1528]">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-zinc-900">
                Ricerca appartamento
              </h2>
              <p class="mt-3 max-w-xs text-sm leading-7 text-zinc-600">
                Filtra per zona, prezzo e tipologia. Confronta immobili, salva i preferiti e parti più velocemente.
              </p>
            </div>
          </div>

        </article>

        <article class="flex min-h-[18rem] flex-col justify-between border-b border-zinc-200 p-8 md:border-b-0 md:border-r md:last:border-r-0">
          <div class="space-y-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9a1528]/10 text-[#9a1528]">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <path d="M16 2v4M8 2v4M3 10h18"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-zinc-900">
                Gestione delle faccende interne
              </h2>
              <p class="mt-3 max-w-xs text-sm leading-7 text-zinc-600">
                Calendario condiviso, lista attività e organizzazione chiara tra coinquilini.
              </p>
            </div>
          </div>


        </article>

        <article class="flex min-h-[18rem] flex-col justify-between p-8">
          <div class="space-y-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9a1528]/10 text-[#9a1528]">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-zinc-900">
                Guasti e manutenzioni
              </h2>
              <p class="mt-3 max-w-xs text-sm leading-7 text-zinc-600">
                Apri ticket, monitora lo stato e conserva lo storico degli interventi.
              </p>
            </div>
          </div>
          
        </article>
      </div>
    </div>
  </section>
</template>