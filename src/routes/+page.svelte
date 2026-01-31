<script lang="ts">
	import { onMount } from 'svelte';
	import { walletState } from '$lib/store.svelte'; // Updated import

	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	import { haveClaimButtplug } from '$lib/contracts.svelte';

	interface NFTData {
		id: string;
		owner: {
			id: string;
		};
		createdAt: string;
	}

	interface GraphQLResponse {
		data: {
			buttpluggyNfts: NFTData[];
		};
	}

	interface PageData {
		wallets: string[];
	}

	// Svelte 5 Props
	let { data }: { data: PageData } = $props();

	const GRAPHQL_URL = 'https://api.studio.thegraph.com/proxy/67825/buttpluggy/version/latest/';

	let idsArr: string[] = [];
	let lastIds: [string, string][] = [];
	let traits: Record<string, string> = $state({}); // Potentially reactive

	async function fetchData(ids: string): Promise<Record<string, string>> {
		const response = await fetch('/api/names', {
			method: 'POST',
			body: ids,
			headers: {
				'content-type': 'application/json'
			}
		});

		return await response.json();
	}

	const fetchLastIds = async (): Promise<void> => {
		const query = `query {
						buttpluggyNfts(first: 6, orderBy:createdAt, orderDirection: desc) {
							id
							owner {
								id
							}
							createdAt
						}
					}`;

		try {
			const response = await fetch(GRAPHQL_URL, {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ query })
			});

			const responseData: GraphQLResponse = await response.json();
			lastIds = responseData.data.buttpluggyNfts.map((nft) => [nft.id, nft.owner.id]);

			idsArr = lastIds.map((id) => id[0]);
			traits = await fetchData(JSON.stringify(idsArr));
		} catch (e) {
			//alert('Unexpected error');
			console.log('Unexpected error');
			console.log('fail to fetch last ids');
			console.error({ e });
		}
	};

	let canClaim = $state(false);

	// Derived state
	let userOnMerkle = $derived(
		walletState.account ? data.wallets.indexOf(walletState.account.toLowerCase()) > -1 : false
	);

	// Side effects replacement
	$effect(() => {
		if (walletState.loadReady && walletState.account) {
			// if user is on merkle tree, lets see if he can claim
			if (userOnMerkle) {
				haveClaimButtplug(walletState.account).then((result: boolean) => {
					// if result is false, user have not claimed yet, so he can claim
					canClaim = !result;
				});
			}
			fetchLastIds();
		}
	});

	onMount(() => {
		// Initialize the global state manager
		walletState.initWeb3();
	});
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>Buttplugs, a Huff powered NFT pixel art collection</title>
	<meta
		name="description"
		content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!"
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.buttpluggy.com/" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Buttplugs, a Huff powered NFT pixel art collection" />
	<meta
		property="og:description"
		content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!"
	/>
	<!--
        You can generate this image URL dynamically: https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/{site_text}/{title_text}/{image_url}/og.png
        Replace the variables in the brackets with your own values and use this URL in the image tag below this comment. Ensure values are URL encoded.
        For more information, read: https://www.opengraph.xyz/blog/how-to-implement-dynamic-open-graph-images
        -->
	<meta
		property="og:image"
		content="https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/buttpluggy.com/Buttplugs%2C%20a%20Huff%20powered%20NFT%20collection/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fdocuments%2F987f816e-a24f-4e2d-affa-8c4fed634f39.png%3Ftoken%3D8J3BbdhXhFu2Y5rAHyj5GnRZsks-yyeeFluAFll4JLM%26height%3D1200%26width%3D1200%26expires%3D33247040340/og.png"
	/>

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="buttpluggy.com" />
	<meta property="twitter:url" content="https://www.buttpluggy.com/" />
	<meta name="twitter:title" content="Buttplugs, a Huff powered NFT pixel art collection" />
	<meta
		name="twitter:description"
		content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!"
	/>
	<meta
		name="twitter:image"
		content="https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/buttpluggy.com/Buttplugs%2C%20a%20Huff%20powered%20NFT%20collection/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fdocuments%2F987f816e-a24f-4e2d-affa-8c4fed634f39.png%3Ftoken%3D8J3BbdhXhFu2Y5rAHyj5GnRZsks-yyeeFluAFll4JLM%26height%3D1200%26width%3D1200%26expires%3D33247040340/og.png"
	/>

	<!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

<Header />

<!-- Hero -->
<section
	class="hero min-h-[85vh] bg-base-100 relative overflow-hidden"
	style="background-image: radial-gradient(at 0% 0%, rgba(var(--primary-rgb), 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(var(--secondary-rgb), 0.15) 0px, transparent 50%);"
>
	<div class="hero-overlay bg-opacity-60"></div>
	<div class="hero-content text-center flex-col z-10">
		<img src="/favicon.gif" alt="Buttpluggy Logo" class="w-24 mb-4 drop-shadow-xl animate-bounce" />
		<h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
			<span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
				>Buttpluggy NFTs</span
			>
		</h1>
		<p class="py-6 max-w-2xl text-xl md:text-2xl text-base-content/80 leading-relaxed">
			<span class="font-bold text-primary">1,024</span> degenerately adorable oscilloscope artworks,
			minted on Ethereum using <span class="font-bold text-secondary">Huff</span>. Crafted by the
			<b>Webtr3s</b> community. No utility. Pure pleasure.
		</p>
		<div class="flex flex-col md:flex-row gap-4 mt-8">
			<a href="/mine" class="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform"
				>🌱 Mine yours</a
			>
			<a href="/attributes" class="btn btn-outline btn-lg hover:scale-105 transition-transform"
				>🖼 View Collection</a
			>
			{#if canClaim}
				<a href="/claim" class="btn btn-secondary btn-lg animate-pulse">🎁 Claim yours</a>
			{/if}
		</div>
	</div>
</section>

<!-- Story Hero with Video -->
<section class="hero min-h-[75vh] bg-base-200 text-base-content">
	<div class="hero-content text-center flex-col max-w-4xl w-full">
		<h2 class="text-4xl font-bold mb-8">The Story</h2>

		<div class="mockup-browser border border-base-300 bg-base-100 shadow-2xl w-full max-w-3xl">
			<div class="mockup-browser-toolbar">
				<div class="input border border-base-300">https://youtube.com/buttpluggy</div>
			</div>
			<div class="aspect-video w-full bg-base-200">
				<iframe
					class="w-full h-full"
					src="https://www.youtube.com/embed/33pkkKa4d4A?si=lsUL8yJPTGro2U9d"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
				></iframe>
			</div>
		</div>

		<p class="mt-10 text-lg md:text-xl text-base-content/70 max-w-2xl">
			Discover how a hacker collective used the <span class="text-accent">Huff language</span> to bring
			oscilloscope visuals to life on Ethereum.
		</p>
	</div>
</section>

<!-- About -->
<section class="py-24 px-4 bg-base-100">
	<div class="max-w-4xl mx-auto space-y-16">
		<div class="grid md:grid-cols-2 gap-12 items-center">
			<div class="space-y-6">
				<h2 class="text-3xl font-bold text-primary">What makes them special?</h2>
				<p class="text-lg text-base-content/80">
					Each Buttpluggy is a unique visual encoded in low-level Huff, rendered as
					oscilloscope-style art, and permanently stored on IPFS. It’s raw, generative, and
					on-chain.
				</p>
			</div>
			<div
				class="card bg-base-200 shadow-xl border border-base-300 p-6 rotate-1 hover:rotate-0 transition"
			>
				<div class="card-body">
					<h3 class="card-title text-secondary">Huff Powered</h3>
					<p>Gas-optimized bytecode masterpieces, signed and sealed on Ethereum.</p>
				</div>
			</div>
		</div>

		<div class="divider"></div>

		<div class="space-y-8">
			<h2 class="text-3xl font-bold text-center">How to get one?</h2>
			<ul class="steps steps-vertical md:steps-horizontal w-full">
				<li class="step step-primary">Connect Wallet</li>
				<li class="step step-primary">Check Whitelist</li>
				<li class="step step-secondary">Solve Hash Puzzle</li>
				<li class="step step-accent">Claim & Flex</li>
			</ul>
		</div>

		<div class="alert alert-info shadow-lg mt-12">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<div>
				<h3 class="font-bold">Open Source</h3>
				<div class="text-xs">
					We believe in transparency. <a
						href="https://github.com/webtresclub/huffplug"
						class="link link-accent">Check the code</a
					>.
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="bg-neutral text-neutral-content py-20 text-center">
	<div class="max-w-2xl mx-auto px-4">
		<h2 class="text-3xl font-bold mb-6">Ready to enter the mines?</h2>
		<p class="mb-8 text-neutral-content/70">
			Join the search for the perfect nonce and claim your piece of history.
		</p>
		<a href="/mine" class="btn btn-accent btn-wide btn-lg shadow-xl shadow-accent/20"
			>🚀 Launch the Miner</a
		>
	</div>
</section>

<Footer />
