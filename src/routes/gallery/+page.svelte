<script lang="ts">
	import { onMount } from 'svelte';
	import { Alchemy, Network } from 'alchemy-sdk';
	import Web3 from 'web3';
	import { account, loadReady } from '$lib/store';

	let nfts = [];
	const ALCHEMY_API_KEY = 'KmDy5q8IZQLOWy8cKhEZB6tUcZgiAsRn';
	const ALCHEMY_API_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
	const buttpluggiesContractAddress = '0x0000420538CD5AbfBC7Db219B6A1d125f5892Ab0';

	const web3 = new Web3(ALCHEMY_API_URL);
	const settings = {
		apiKey: ALCHEMY_API_KEY,
		network: Network.ETH_MAINNET
	};

	let options = {
		excludeFilters: 'SPAM'
	};

	const alchemy = new Alchemy(settings);

	const getButtpluggies = async () => {
		try {
			// Get the NFTs owned by the wallet
			let response = await alchemy.nft.getNftsForOwner($account, options);

			// Create a gallery of the NFTs
			nfts = response.ownedNfts.filter((nft) => {
				return nft.contract.address == buttpluggiesContractAddress;
			});
			return nfts;
		} catch (e) {
			console.error({ e });
		}
	};

	$: if ($account && $loadReady) {
		getButtpluggies();
	}
</script>

<main class="container">
  <h3 style="margin-top: 20px">My Buttpluggies Gallery</h3>
  <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
    {#each nfts as nft (nft.name)}
      <div class="card mx-auto">
        <div class="card__image">
          <a href={`https://opensea.io/assets/ethereum/${buttpluggiesContractAddress}/${nft.tokenId}`} target="_blank">
            <img width="276" height="276" src={nft.image.cachedUrl} alt={nft.name} />
          </a>
        </div>
        <div class="card__content">
          <h2>{nft.name}</h2>
          <p>ID: {nft.tokenId.slice(-4)}</p>
          <!-- <p>{nft.description}</p> -->
        </div>
      </div>
    {/each}
  </div>
  
</main>