<script lang="ts">
	import { BUTTPLUGGY } from '$lib/contracts';
	import data from '$lib/data';
	import { account, chainId, loadReady } from '$lib/store';

	let nfts = [];
	let loading = true;

	async function loadNfts() {
		loading = true;
		try {
			nfts = JSON.parse(localStorage.getItem('ntfs-' + $chainId + $account) || '[]');
			if(nfts.length > 0) {
				loading = false;
				return;
			}
		} catch (err) {
			/* empty */
		}
		
		const query = `query myQuery($owner: Bytes!){
					buttpluggyNfts(where: {owner: $owner}){
						id
						owner {
							id
						}
					}
				}`;

		const options = {
			owner: $account.toLowerCase()
		};

		try {
			const response = await fetch('/api', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					query: query,
					variables: options
				})
			});

			const responseData = await response.json();
			
			const ids = responseData.data.buttpluggyNfts.map((nft) => nft.id);
			for(let i=0;i<ids.length;i++){
				data[ids[i]].id = ids[i];
				nfts.push(data[ids[i]])
			}

			localStorage.clear();
			localStorage.setItem('ntfs-' + $chainId + $account, JSON.stringify(nfts));
		} catch (err) {
			alert('unexpected error');
			console.error('err');
			console.error(err);
		}
		loading = false;
	}

	$: if ($loadReady && $chainId != 0 && $account) {
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
			{#each nfts as nft}
				<div class="card mx-auto" >
					<div class="card__image">
						<a href="https://opensea.io/assets/ethereum/{BUTTPLUGGY}/{nft.id}" target="_blank">
							<img class="h-64 w-64 block" src="/images/{('00000'+nft.id).slice(-4)}.gif" alt={nft.name} />
						<!-- </a> -->
					</div>
					<div class="card__content">
						<h3>{nft.name}</h3>
						<p>ID: {nft.id}</p>
						<!-- <p>{nft.description}</p> -->
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>
