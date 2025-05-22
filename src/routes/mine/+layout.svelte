<script lang="ts">

	import { onMount } from 'svelte';

	import { initWeb3 } from '$lib/store';

	let { children } = $props();

	import Header from '../Header.svelte';
	import Footer from '../Footer.svelte';
	onMount(() => {
		initWeb3();
	});
</script>


<div class="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
	<Header />

	{@render children()}

	<Footer />
</div>
