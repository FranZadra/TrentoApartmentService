<template>
	<section class="relative overflow-hidden bg-white">
		<div class="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
			<div class="flex flex-col justify-center gap-8">
				<div class="inline-flex w-fit items-center gap-2 rounded-full border border-[#9a1528]/20 bg-[#9a1528]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#9a1528]">
					Porta centrale per casa, manutenzioni e ospiti
				</div>

				<div class="max-w-2xl space-y-6">
					<p class="font-display text-4xl font-bold leading-none text-zinc-900 sm:text-5xl lg:text-6xl">
						Benvenuti sul portale TAS,
					</p>
					<p class="max-w-xl text-lg leading-8 text-zinc-700 sm:text-xl">
						La piattaforma che digitalizza l'intero ciclo di vita della tua prossima locazione, con uno stile pulito, diretto e immediato.
					</p>
				</div>

				<div class="flex flex-wrap gap-4">
					<router-link
						to="/annunci"
						class="inline-flex items-center justify-center rounded-full bg-[#9a1528] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(154,21,40,0.2)] hover:bg-[#7f1020]"
					>
						Cerca appartamento
					</router-link>
					<a
						href="#features"
						class="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 hover:border-[#9a1528] hover:text-[#9a1528]"
					>
						Scopri le funzioni
					</a>
				</div>

				<div class="grid gap-4 pt-4 sm:grid-cols-3">
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">01</p>
						<p class="mt-2 text-sm text-zinc-600">Ricerca, confronto e salvataggio annunci</p>
					</div>
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">02</p>
						<p class="mt-2 text-sm text-zinc-600">Task interni e organizzazione condivisa</p>
					</div>
					<div class="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
						<p class="text-2xl font-bold text-[#9a1528]">03</p>
						<p class="mt-2 text-sm text-zinc-600">Guasti, ticket e manutenzioni tracciate</p>
					</div>
				</div>
			</div>

			<div class="relative flex items-center justify-center">
				<div class="absolute left-0 top-12 h-24 w-24 rounded-full bg-[#9a1528]/10 blur-2xl"></div>
				<div class="absolute bottom-12 right-4 h-32 w-32 rounded-full bg-[#9a1528]/15 blur-3xl"></div>

				<div class="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
					<div class="grid min-h-[28rem] gap-4 rounded-[1.5rem] bg-white p-4 sm:grid-cols-[0.82fr_1.18fr]">
						<div class="flex flex-col justify-between rounded-[1.25rem] bg-[#9a1528] p-6 text-white">
							<div>
								<p class="text-xs uppercase tracking-[0.35em] text-white/70">TAS</p>
								<p class="mt-6 max-w-[12ch] font-display text-4xl font-bold leading-none">
									Foto sotto
								</p>
							</div>
							<p class="text-sm leading-6 text-white/80">
								Un'area visuale ampia e pulita per raccontare il servizio senza appesantire la pagina.
							</p>
						</div>

						<div class="flex flex-col gap-4 rounded-[1.25rem] border border-dashed border-zinc-200 bg-[linear-gradient(135deg,#fafafa_0%,#ffffff_55%,#f6f2f3_100%)] p-5">
							<div class="grid flex-1 grid-rows-[1fr_auto] gap-4">
								<div class="rounded-[1.25rem] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(154,21,40,0.18),transparent_45%),linear-gradient(180deg,#ffffff,#f7f7f7)] p-5">
									<div class="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
										<span>Ricerca</span>
										<span>Locazione</span>
									</div>
									<div class="mt-8 space-y-4">
										<div class="h-2 w-2/3 rounded-full bg-zinc-200"></div>
										<div class="h-2 w-5/6 rounded-full bg-zinc-200"></div>
										<div class="h-2 w-3/5 rounded-full bg-zinc-200"></div>
									</div>
									<div class="mt-8 flex items-end justify-between gap-4">
										<div class="space-y-2">
											<div class="h-8 w-28 rounded-full bg-[#9a1528]"></div>
											<div class="h-2 w-24 rounded-full bg-zinc-200"></div>
										</div>
										<div class="h-24 w-24 rounded-full border border-[#9a1528]/25 bg-white"></div>
									</div>
								</div>
								<div class="flex items-center justify-between rounded-[1.25rem] bg-zinc-900 px-4 py-3 text-white">
									<span class="text-xs uppercase tracking-[0.3em] text-white/60">TAS Portal</span>
									<span class="text-sm font-semibold text-[#ffb0ba]">White + Red</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
