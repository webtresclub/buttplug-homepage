<script lang="ts">
	import { currentDifficultyAndSalt, totalMinted, difficulty, salt, mint, ownerOf } from '$lib/contracts';
	import { loadReady, modal, account } from '$lib/store';
	import { keccak256, encodePacked } from 'viem';
	import { onMount } from 'svelte';

	import NumberTween from './NumberTween.svelte';

	const random = Math.floor(Math.random() * (1024 - 1 + 1) + 1)
		.toString()
		.padStart(4, '0');

	let globalStatus = 'idle';
	let workers = [];
	let results = [];

	let totalCores = 1;
	let coresSelected = 1;

	let totalSpeed = 0;
	let expectedTime = 0;

	let globalStart;
	let globalElapsed;

	let intervalCount;

	$: if (workers.length > 0 && workers[0].hashPerSecond > 0 && $difficulty > 0) {
		totalSpeed = workers.reduce((total, w) => total + w.hashPerSecond, 0);
		expectedTime = Math.pow(16, Number($difficulty)) / Math.floor(totalSpeed);
	}

	function secondsToDayHMS(d) {
		d = Number(d);
		var days = Math.floor(d / 86400);
		var h = Math.floor((d % 86400) / 3600);
		var m = Math.floor(((d % 86400) % 3600) / 60);
		var s = Math.floor(((d % 86400) % 3600) % 60);

		var dDisplay = days > 0 ? days + (days == 1 ? ' day, ' : ' days, ') : '';
		var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
		var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
		var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
		return dDisplay + hDisplay + mDisplay + sDisplay;
	}

	$: if ($loadReady) {
		currentDifficultyAndSalt();
	}

	onMount(async () => {
		totalCores = navigator.hardwareConcurrency;
		coresSelected = Math.ceil(totalCores / 2);
	});

	async function useNonce() {
		const _nonce = prompt('Enter the nonce (hexa or number) to mint the buttplug:');
		if (_nonce) {
			const nonce = BigInt(_nonce);
			const hash = keccak256(
				encodePacked(['address', 'bytes32', 'uint256'], [$account, $salt, nonce])
			);
			const hashNumber = BigInt(hash);
			const expectedHash = '0x' + '0'.repeat(parseInt($difficulty));
			if (!hash.startsWith(expectedHash)) {
				alert(
					'The nonce is not valid, hash not starts with ' +
						expectedHash +
						' - current hash: ' +
						hash
				);
				return;
			}

			const buttpluggyId = (hashNumber % 1024n) + 1n;
			const owner = await ownerOf(buttpluggyId);
						
			// @todo CHECK THAT THE BUTTPLUGGY IS NOT ALREADY MINTED
			globalStatus = 'idle';
			results.push({
				nonce,
				buttplug: buttpluggyId,
				owner
			});

			results = [...results];
		}
	}

	async function mintButtplug(nonce) {
		try {
			await mint(nonce);
			alert('Minted');
		} catch (e) {
			alert(e.message);
		}
	}

	function doStop() {
		globalStatus = 'idle';
		workers.forEach((w) => {
			w.worker.terminate();
			w.status = 'stop';
		});
		workers = [...workers];
		clearInterval(intervalCount);
	}

	function terminateWorkers() {
		doStop();
		workers = [];
	}

	function mineToggle() {
		if (globalStatus == 'mining') {
			doStop();
		} else {
			startMining();
		}
	}

	async function miningComplete(result) {
		if (result[1] == -1) {
			startMining();
		} else {
			doStop();
			console.log('Complete', result);
		}
	}

	function startMining() {
		terminateWorkers();

		globalStatus = 'mining';
		const cores = Math.min(coresSelected, Math.min(navigator.hardwareConcurrency, 20));

		globalStart = +new Date();
		intervalCount = setInterval(() => {
			globalElapsed = +new Date() - globalStart;
		}, 1000);

		for (let i = 0; i < cores; i++) {
			const worker = new Worker('/js/rust-worker.js', { type: 'module' });
			workers[i] = { worker: worker, status: 'init', start: 0, end: 0, loops: 0, hashPerSecond: 0 };

			let time;

			worker.onmessage = function (event) {
				// console.log('Worker' + i, event.data.status);
				workers[i].status = event.data.status;

				workers[i].start = workers[i].start || Date.now();

				worker.onmessage = async function (event) {
					if (event.data.results.nonce) {
						console.log('Worker' + i, event.data.results);
						const buttpluggyId = (BigInt('0x' + event.data.results.hash) % 1024n) + 1n;
						const owner = await ownerOf(buttpluggyId);
						foundNonce(event.data.results, owner);
						doStop();
						clearInterval(intervalCount);
						return;
					}
					workers[i].loops += 1;
					workers[i].hashPerSecond = Math.floor(
						(workers[i].loops * 1000000) / ((Date.now() - workers[i].start) / 1000)
					);
					console.log('Worker' + i + ', hash/sec:', workers[i].hashPerSecond);
					workers[i].end = 0;

					// loop
					worker.postMessage({
						wallet: $account.slice(2),
						salt: $salt.slice(2),
						difficulty: Number($difficulty)
					});
				};

				worker.postMessage({
					wallet: $account.slice(2),
					salt: $salt.slice(2),
					difficulty: Number($difficulty)
				});
			};
		}
		workers = [...workers];
	}

	function foundNonce({ nonce, hash }, owner) {
		console.log('Found nonce', nonce, hash);
		nonce = BigInt('0x' + nonce);
		hash = BigInt('0x' + hash);
		console.log(hash, (hash % 1024n) + 1n);

		doStop();
		results.push({
			nonce,
			buttplug: (hash % 1024n) + 1n,
			owner
		});
		results = [...results];
	}
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>Mine yout Buttplugy</title>
	<meta
		name="description"
		content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!"
	/>

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.buttpluggy.com/mine" />
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
	<meta property="twitter:url" content="https://www.buttpluggy.com/mine" />
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

	<meta name="fc:frame" content="vNext" />
	<meta name="og:image" content="https://buttpluggy.com/main.png" />
	<meta
		property="fc:frame:image"
		content="https://bafybeidd62ezqvyyviibduxaz2wuuyexkpuwbdfo34wukucxtav7qh3cbe.ipfs.dweb.link/{random}.gif"
	/>
	<meta property="fc:frame:image:aspect_ratio" content="1:1" />
	<meta property="fc:frame:button:1" content="Next Buttpluggy" />
	<meta property="fc:frame:post_url" content="https://www.buttpluggy.com/mine" />
	<meta name="fc:frame:button:2" content="More info..." />
	<meta name="fc:frame:button:2:action" content="link" />
	<meta name="fc:frame:button:2:target" content="https://buttpluggy.com/buttpluggy/{random}" />
	<!-- <meta name="fc:frame:button:3" content="Not minted yet!! Try to mine it..." />
	<meta name="fc:frame:button:3:action" content="link" />
	<meta name="fc:frame:button:3:target" content="https://buttpluggy.com/mine" /> -->
</svelte:head>

<main class="container">
	<article class="bg-gray-900">
		<div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
			<h1
				class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl dark:text-white"
			>
				Mine your Buttpluggy
			</h1>
			<p class="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400">
				You must find a nonce that when encrypting it with your wallet address and a salt through <code
					class="display-inline!important">keccak256(encodePacked(YOUR_WALLET,SALT,NONCE))</code
				>
				results in a <code>bytes32</code> hex that starts with {$difficulty} zeroes.
			</p>
			<div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
				{#if !$account}
					<p>First connect your wallet</p>
					<button on:click={() => { $modal.open(); }}
						class="blue-connect-btn"
					>
						Connect
					</button>
				{/if}
			</div>
			<hr />
			{#if $account}
				<div class="mt-6 p-4 mx-auto text-left font-mono">
					Total Minted: {$totalMinted}/1024<br />
					User wallet: {$account}<br />
					Current difficulty: {$difficulty}<br />
					Current salt: {$salt}<br />
					<!-- Min 1 worker Max cores.length-->
					<div class="flex items-center mx-auto mb-1">
						Workers:
						<span on:click={() => (coresSelected == 1 ? 1 : coresSelected--)} class="core-button"
							>-</span
						>
						{coresSelected}
						<span
							on:click={() => (coresSelected == totalCores ? totalCores : coresSelected++)}
							class="core-button">+</span
						>
					</div>
				</div>
				<br />
				{#if globalStatus == 'idle'}
					<button
						on:click={() => {
							mineToggle();
						}}
						class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
					>
						Start mine
					</button>
				{:else}
					<button
						on:click={() => {
							mineToggle();
						}}
						class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
					>
						Stop mining
					</button>
				{/if}
				<button
					on:click={() => {
						useNonce();
					}}
					class="bg-transparent inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
				>
					Use a nonce
				</button>
			{/if}
		</div>

		{#each workers as w, i}
			<div class="font-mono">
				{#if w.hashPerSecond > 0}
					Worker{i} speed: <NumberTween currentNumber={w.hashPerSecond} /> hash/sec
					{#if w.status == 'stop'}
						- <span class="bg-red-600">STOPPED</span>
					{/if}
				{:else}
					<span class="font-bold text-green-400">Worker{i} Starting</span>
				{/if}
			</div>
		{/each}
		{#if workers.length > 0 && workers[0].hashPerSecond > 0}
			<div class="font-mono text-white">
				Total speed: {Math.floor(totalSpeed / 1000)} KH/s<br />
				Expect to mine one in {secondsToDayHMS(expectedTime)} (aprox based con current hashrate)<br
				/>
				Time elapsed: {secondsToDayHMS(globalElapsed / 1000)}
			</div>
		{/if}

		{#each results as data}
			<div class="font-mono">
				Buttpluggy id: {data.buttplug} - Nonce: {data.nonce}
			</div>
			<div class="w-52">
				<img
					src="/images/{('0000' + data.buttplug).slice(-4)}.gif"
					class="w-52 h-52"
					alt="Buttplug {data.buttplug}"
				/>
				<button
					disabled={data.owner != '0x0000000000000000000000000000000000000000'}
					class="rounded-b-lg w-52 bg-blue-500 text-white p-2 text-center cursor-pointer select-none"
					on:click={() => {
						mintButtplug(data.nonce);
					}}>Mint Buttpluggy #{data.buttplug}</button> 
				</div>
			{#if data.owner != '0x0000000000000000000000000000000000000000'}
				<p class >Already minted by {data.owner}</p>
			{/if}
			<hr />
		{/each}
	</article>
</main>

<style lang="postcss">
	.core-button {
		@apply rounded border border-slate-500 w-6 h-6 text-center mx-1 cursor-pointer select-none;
	}
	.core-button:hover {
		@apply bg-slate-500 text-white;
	}
	.blue-connect-btn {
		@apply inline-flex justify-center items-center py-3 px-5 
		text-base font-medium text-center text-white rounded-lg 
		bg-blue-700;
	}
	.blue-connect-btn:hover { @apply bg-blue-800; }
	.blue-connect-btn:focus { @apply ring-4 ring-blue-300; }
	.blue-connect-btn:dark:focus { @apply ring-blue-900; }

</style>
