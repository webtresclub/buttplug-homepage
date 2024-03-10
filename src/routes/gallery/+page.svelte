<script lang="ts">
	import { BUTTPLUGGY } from "$lib/contracts";
	import { Alchemy, Network } from 'alchemy-sdk';
	import { account, chainId, loadReady } from '$lib/store';

	let nfts = [];
	const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
	let loading = true;

	async function loadNfts() {
		loading = true;
		try {
			nfts = JSON.parse(localStorage.getItem('ntfs-'+$chainId+$account) || '[]');
		} catch(err) { /* empty */ }
		const settings = {
			apiKey: ALCHEMY_API_KEY,
			network: $chainId != 1 ? Network.ETH_SEPOLIA : Network.ETH_MAINNET
		};

		try {
			const alchemy = new Alchemy(settings);

			// Get the NFTs owned by the wallet
			const response = await alchemy.nft.getNftsForOwner($account, { excludeFilters: 'SPAM' });
			// Create a gallery of the NFTs
			nfts = response.ownedNfts.filter((nft) => {
				return nft.contract.address == BUTTPLUGGY;
			});
			localStorage.setItem('ntfs-'+$chainId+$account, JSON.stringify(nfts));

		} catch(err) {
			alert('unexpected error');
			console.error("err");
			console.error(err);
		}
		loading = false;
	}

	$: if($loadReady && $chainId != 0 && $account) {
		loadNfts();
	}

</script>
<main class="container">
	{#if !$account}
	  <h3 class="mt-5">First connect your wallet</h3>
	{:else if loading}
		<h3 class="mt-5">LOADING</h3>
		<div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
			{#each Array(4) as _}
			<div class="animate-pulse flex space-x-4">
				<div class="bg-slate-700 h-64 w-64 block"></div>
			</div>
			{/each}
		</div>
	{:else if nfts.length === 0}
		<h3 class="mt-5">You still don't own any Buttplug! Go mine one!</h3>
		<a href="/mine" role="button">Mine your Buttpluggy</a> <br />
	{:else}
		<h3 class="mt-5">My Mainnet Buttpluggies Gallery</h3>
		<div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
			{#each nfts as nft (nft.name)}
			<div class="card mx-auto">
				<div class="card__image">
				<a href="https://opensea.io/assets/ethereum/{BUTTPLUGGY}/{nft.tokenId}" target="_blank">
					<img class="h-64 w-64 block" src={nft.image.cachedUrl} alt={nft.name} />
				</a>
				</div>
				<div class="card__content">
				<h3>{nft.name}</h3>
				<p>ID: {nft.tokenId.slice(-4)}</p>
				<!-- <p>{nft.description}</p> -->
				</div>
			</div>
			{/each}
		</div>
	{/if}
</main>