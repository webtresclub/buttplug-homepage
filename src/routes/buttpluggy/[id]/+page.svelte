<script lang="ts">
	import Breadcrumbs from '$lib/Breadcrumbs.svelte';
	import { page } from '$app/stores';
	import slugify from 'slug';

	export let data;

	const id = $page.params.id;
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>Buttpluggy #{id} - {data.buttplug.name}</title>
	<meta name="description" content={data.buttplug.description} />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.buttpluggy.com/buttpluggy/{id}" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Buttpluggy #{id} - {data.buttplug.name}" />
	<meta property="og:description" content={data.buttplug.description} />
	<!--
	You can generate this image URL dynamically: https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/{site_text}/{title_text}/{image_url}/og.png
	Replace the variables in the brackets with your own values and use this URL in the image tag below this comment. Ensure values are URL encoded.
	For more information, read: https://www.opengraph.xyz/blog/how-to-implement-dynamic-open-graph-images
	-->
	<meta
		property="og:image"
		content="https://www.buttpluggy.com/images_small/{('00000' + id).slice(-4)}.png"
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="buttpluggy.com" />
	<meta property="twitter:url" content="https://www.buttpluggy.com/buttpluggy/{id}" />
	<meta name="twitter:title" content="Buttpluggy #{id} - {data.buttplug.name}" />
	<meta name="twitter:description" content={data.buttplug.description} />
	<meta
		name="twitter:image"
		content="https://www.buttpluggy.com/images_small/{('00000' + id).slice(-4)}.png"
	/>

	<!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

<div class=" backdrop-blur-md border-b border-slate-700">
	<div class="container mx-auto px-4 py-2">
		<div class="breadcrumbs text-sm">
			<ul>
				<li><a href="/">Home</a></li>
				<li class="text-white">Buttpluggy #{id}</li>
			</ul>
		</div>
	</div>
</div>

<div class="w-full flex flex-col md:flex-row my-10 mx-auto max-w-5xl gap-6">
	<!-- NFT Card -->
	<div
		class="w-full max-w-sm mx-auto bg-base-200 rounded-xl shadow-xl border border-base-300 overflow-hidden"
	>
		
		<iframe class="w-full aspect-square object-cover" src="/assets/${id}" title={`Buttpluggy ${id} preview`}></iframe>
		<!--
		<img
			class="w-full aspect-square object-cover"
			src={`/images/${('00000' + id).slice(-4)}.gif`}
			alt={`Buttpluggy ${id}`}
		/>
		-->

		<div class="p-5 space-y-4">
			<h2 class="text-2xl font-bold text-primary">Buttpluggy #{id}</h2>

			<div class="divider">Attributes</div>

			<div class="space-y-2">
				{#each data.buttplug.attributes as a}
					<div class="flex items-start gap-3 p-2 bg-base-100 rounded-lg border border-base-300">
						<div class="text-lg">✔️</div>
						<div>
							<a
								href={`/attributes/${slugify(a.trait_type + '-' + a.value)}`}
								class="font-semibold hover:underline text-secondary"
							>
								{a.trait_type}: {a.value}
							</a>
							<p class="text-sm text-base-content/70">
								{data.grouped[a.trait_type + '-' + a.value]} buttpluggies share this trait.
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Description Block -->
	<div class="flex-1 p-4">
		<h5 class="text-4xl font-bold text-primary-content mb-4">{data.buttplug.name}</h5>
		<p class="text-base-content text-lg leading-relaxed">{data.buttplug.description}</p>
	</div>
</div>
