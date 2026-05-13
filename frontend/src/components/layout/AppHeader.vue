<template>
	<header class="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
		<div class="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
			<router-link to="/" class="group flex items-center gap-3">
				<div class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#9a1528] text-[0.7rem] font-black tracking-[0.28em] text-[#9a1528] transition-transform group-hover:-translate-y-0.5">
					TAS
				</div>
				<div class="hidden sm:block">
					<p class="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-zinc-500">
						Trento Apartment Service
					</p>
				</div>
			</router-link>

			<nav class="flex items-center gap-6 text-sm font-semibold text-zinc-700 sm:gap-8">
				<router-link to="/" class="hover:text-[#9a1528]">Home</router-link>
				<router-link to="/annunci" class="hover:text-[#9a1528]">
					Ricerca appartamento
				</router-link>
				<router-link
					to="/signin"
					class="rounded-full border border-[#9a1528] px-4 py-2 text-[#9a1528] hover:bg-[#9a1528] hover:text-white"
				>
					Sign in
				</router-link>
			</nav>
		</div>
	</header>
</template>
