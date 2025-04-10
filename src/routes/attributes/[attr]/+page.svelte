<script lang="ts">
	import Breadcrumbs from '$lib/Breadcrumbs.svelte';
	import { page } from '$app/stores';
	import shuffle from '$lib/shuffle.js';

	export let data;

	$: ids = [...shuffle(data.ids)];

	let hovered = 0;

	const attr = $page.params.attr;
</script>

<div class=" backdrop-blur-md border-b border-slate-700 mb-6">
	<div class="container mx-auto px-4">
		<!-- Breadcrumbs -->
		<div class="breadcrumbs text-sm text-base-content/70">
			<ul>
				<li><a href="/" class="hover:underline">Home</a></li>
				<li><a href="/attributes" class="hover:underline">Attributes</a></li>
				<li><span class="font-semibold text-base-content">{attr}</span></li>
			</ul>
		</div>
	</div>
</div>

<!-- Main Content -->
<main class="container mx-auto px-4 pb-10">
	<h1 class="text-4xl font-bold text-primary mb-6 capitalize">{attr}</h1>

	<div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4">
		{#each ids as id}
			<a
				href={`/buttpluggy/${id}`}
				on:mouseenter={() => {
					hovered = id;
				}}
				on:mouseleave={() => {
					hovered = 0;
				}}
				class="group"
			>
				<img
					src={(hovered == id ? '/images/' : '/images_small/') +
						('00000' + id).slice(-4) +
						(hovered == id ? '.gif' : '.png')}
					alt={`Buttpluggy ${id}`}
					class="transition-all duration-200 hover:scale-110 rounded-md border border-base-300"
				/>
			</a>
		{/each}
	</div>
</main>
