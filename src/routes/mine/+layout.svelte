<script lang="ts">
	import { onMount } from 'svelte';

	import { walletState } from '$lib/store.svelte';

	let { children } = $props();

	import Header from '../Header.svelte';
	import Footer from '../Footer.svelte';
	onMount(() => {
		walletState.initWeb3();
	});
</script>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
	<Header />

	{@render children()}

	<Footer />
</div>
