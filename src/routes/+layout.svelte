<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { initWeb3 } from '../lib/store';

	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	onMount(() => {
		initWeb3();
	});
</script>

<svelte:head>
	{#if dev}
		<script>
			if (!window.process) {
				window.process = { env: { NODE_ENV: 'development' } };
			}
		</script>
	{:else}
		<script>
			if (!window.process) {
				window.process = { env: { NODE_ENV: 'production' } };
			}
		</script>
	{/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
	<Header />

	<!-- El contenido principal se inyecta acá -->
	<slot />

	<Footer />
	
</div>
