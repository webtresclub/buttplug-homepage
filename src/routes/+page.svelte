<script lang="ts">
	import { modal } from '$lib/store';
	import { account, loadReady } from '../lib/store';
	import { haveClaimButtplug } from '$lib/contracts';

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

	export let data: PageData;
	const GRAPHQL_URL = 'https://api.studio.thegraph.com/proxy/67825/buttpluggy/version/latest/';

	let userOnMerkle = false;
	let idsArr: string[] = [];
	let lastIds: [string, string][] = [];
	let traits: Record<string, string> = {};

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

	let canClaim = false;
	$: if ($loadReady) {
		// lets see if current wallet is on the merkle tree
		userOnMerkle = data.wallets.indexOf($account.toLowerCase()) > -1;
		// if user is on merkle tree, lets see if he can claim (he could already claimed, only one per wallet)
		if (userOnMerkle) {
			haveClaimButtplug($account as `0x${string}`).then((result) => {
				// if result is false, user have not claimed yet, so he can claim
				canClaim = !result;
			});
		}
		fetchLastIds();
	}
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

<!-- Hero -->
<section class="hero min-h-[85vh] bg-cyan-800 text-center">
	<div class="hero-content flex-col">
		<img src="/favicon.gif" alt="Buttpluggy Logo" class="w-20 h-20 animate-bounce" />
		<h1 class="text-5xl font-bold tracking-tight">Buttpluggy NFTs</h1>
		<p class="py-6 max-w-2xl text-lg">
			<span class="font-semibold">1,024</span> degenerately adorable oscilloscope artworks, minted
			on Ethereum using <span class="font-bold">Huff</span>. Crafted by the
			<b>Webtr3s</b> community, pushing pixel art into on-chain realms. No utility. Pure pleasure.
		</p>
		<div class="flex gap-4">
			<a href="/mine" class="btn btn-primary btn-xl">🌱 Mine your Buttpluggy</a>
			<a href="/attributes" class="btn btn-outline btn-xl">🖼 View Collection</a>
			{#if canClaim}
				<a href="/claim" class="btn btn-outline btn-xl">🎁 Claim your Buttpluggy</a>
			{/if}
		</div>
	</div>
</section>

<!-- About -->
<section class="py-16 px-4 bg-base-100">
	<div class="max-w-4xl mx-auto space-y-10 text-left">
		<h2 class="text-3xl font-bold">What makes them special?</h2>
		<p class="text-lg">
			Each Buttpluggy is a unique visual encoded in low-level Huff, rendered as oscilloscope-style
			art, and permanently stored on IPFS. It’s raw, generative, and on-chain—true crypto art with
			no fluff.
		</p>

		<h2 class="text-3xl font-bold">Why Huff?</h2>
		<p class="text-lg">
			Huff lets us write ultra-efficient smart contracts. Buttpluggies aren’t just art—they're
			gas-optimized bytecode masterpieces, signed and sealed on Ethereum.
		</p>

		<h2 class="text-3xl font-bold">How to get one?</h2>
		<ol class="list-decimal list-inside text-lg space-y-2">
			<li>Connect your wallet (like MetaMask).</li>
			<li>Check if you're whitelisted (owning 2+ Webtr3s POAPs helps).</li>
			<li>Mine a Buttpluggy by solving a proof-of-work hash puzzle.</li>
			<li>Claim and flex your Buttpluggy.</li>
		</ol>

		<h2 class="text-3xl font-bold">Join the community</h2>

		<h2 class="text-3xl font-bold">Open source</h2>
		<p class="text-lg">
			We believe in transparency. <a href="https://github.com/webtresclub/huffplug">Our code</a> is open-source,
			allowing anyone to verify and contribute. Buttpluggies are not just collectibles; they’re a movement.
		</p>
	</div>
</section>

<!-- CTA -->
<section class="bg-base-200 py-12 text-center">
	<h2 class="text-2xl font-bold mb-4">Ready to mint yours?</h2>
	<a href="/mine" class="btn btn-accent btn-wide text-lg">🚀 Launch the Miner</a>
</section>
