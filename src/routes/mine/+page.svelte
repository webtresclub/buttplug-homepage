<script lang="ts">
	import {
		chainTimestamp,
		getTimestamp,
		currentDifficultyAndSalt,
		totalMinted,
		difficulty,
		salt,
		mint,
		ownerOf
	} from '$lib/contracts';
	import { loadReady, modal, account } from '$lib/store';
	import { keccak256, encodePacked } from 'viem';
	import { onMount } from 'svelte';

	import NumberTween from './NumberTween.svelte';

	interface WorkerData {
		worker: Worker;
		status: string;
		start: number;
		end: number;
		loops: number;
		hashPerSecond: number;
	}

	interface MiningResult {
		nonce: bigint;
		buttplug: bigint;
		owner: string;
	}

	interface WorkerResult {
		nonce: string;
		hash: string;
		status?: string;
	}

	const random = Math.floor(Math.random() * (1024 - 1 + 1) + 1)
		.toString()
		.padStart(4, '0');

	let globalStatus = 'idle';
	let workers: WorkerData[] = [];
	let results: MiningResult[] = [];

	let totalCores = 1;
	let coresSelected = 1;

	let totalSpeed = 0;
	let expectedTime = 0;

	let globalStart: number;
	let globalElapsed: number;
	let deltaChange: number;
	let intervalCount: ReturnType<typeof setInterval>;

	$: if ($totalMinted && $chainTimestamp && $difficulty) {
		const changeDate =
			($totalMinted - ($difficulty - 5n) * ($difficulty - 5n) + 1n) * 86400n + 1708108000n;
		deltaChange = Number(changeDate) - Number($chainTimestamp);
	}

	$: if (workers.length > 0 && workers[0].hashPerSecond > 0 && $difficulty > 0) {
		totalSpeed = workers.reduce((total, w) => total + w.hashPerSecond, 0);
		expectedTime = Math.pow(16, Number($difficulty)) / Math.floor(totalSpeed);
	}

	function secondsToDayHMS(d: number): string {
		const days = Math.floor(d / 86400);
		const h = Math.floor((d % 86400) / 3600);
		const m = Math.floor(((d % 86400) % 3600) / 60);
		const s = Math.floor(((d % 86400) % 3600) % 60);

		const dDisplay = days > 0 ? days + (days == 1 ? ' day, ' : ' days, ') : '';
		const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
		const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
		const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
		return dDisplay + hDisplay + mDisplay + sDisplay;
	}

	$: if ($loadReady) {
		currentDifficultyAndSalt();
		getTimestamp();
	}

	onMount(() => {
		totalCores = navigator.hardwareConcurrency;
		coresSelected = Math.ceil(totalCores / 2);

		const reloadInterval = setInterval(() => {
			currentDifficultyAndSalt();
		}, 1000 * 60); // every minute just in case

		const intervalTimestamp = setInterval(() => {
			if ($chainTimestamp && $chainTimestamp > 0n) $chainTimestamp = $chainTimestamp + 1n;
		}, 1000); // every 5 minutes

		return () => {
			clearInterval(reloadInterval);
			clearInterval(intervalTimestamp);
		};
	});

	async function useNonce() {
		const _nonce = prompt('Enter the nonce (hexa or number) to mint the buttplug:');
		if (_nonce) {
			const nonce = BigInt(_nonce);
			const hash = keccak256(
				encodePacked(
					['address', 'bytes32', 'uint256'],
					[$account as `0x${string}`, $salt as `0x${string}`, nonce]
				)
			);
			const hashNumber = BigInt(hash);
			const expectedHash = '0x' + '0'.repeat(parseInt($difficulty as string));
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

	async function mintButtplug(nonce: bigint) {
		try {
			await mint(nonce);
			alert('Minted');
		} catch (e: unknown) {
			if (e instanceof Error) {
				alert(e.message);
			}
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

	async function miningComplete(result: [string, number]) {
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

			worker.onmessage = function (event: MessageEvent<WorkerResult>) {
				workers[i].status = event.data.status || '';

				workers[i].start = workers[i].start || Date.now();

				worker.onmessage = async function (event: MessageEvent<{ results: WorkerResult }>) {
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
						wallet: ($account as `0x${string}`).slice(2),
						salt: ($salt as `0x${string}`).slice(2),
						difficulty: Number($difficulty)
					});
				};

				worker.postMessage({
					wallet: ($account as `0x${string}`).slice(2),
					salt: ($salt as `0x${string}`).slice(2),
					difficulty: Number($difficulty)
				});
			};
		}
		workers = [...workers];
	}

	function foundNonce(result: WorkerResult, owner: string) {
		if (!result.nonce || !result.hash) return;

		console.log('Found nonce', result.nonce, result.hash);
		const nonceBigInt = BigInt('0x' + result.nonce);
		const hashBigInt = BigInt('0x' + result.hash);
		console.log(hashBigInt, (hashBigInt % 1024n) + 1n);

		doStop();
		results.push({
			nonce: nonceBigInt,
			buttplug: (hashBigInt % 1024n) + 1n,
			owner
		});
		results = [...results];
	}

	$: if (deltaChange > 0) {
		secondsToDayHMS(deltaChange);
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

<div class="max-w-5xl mx-auto p-6">
	<div class="prose dark:prose-invert">
		<h1 class="text-4xl font-bold">Mine your Buttpluggy</h1>
		<p class="text-lg">
			You must find a nonce such that <code>keccak256(encodePacked(YOUR_WALLET, SALT, NONCE))</code>
			results in a
			<code>bytes32</code> hash starting with <strong>{$difficulty}</strong> zeroes.
		</p>
	</div>

	{#if !$account}
		<div class="mt-4">
			<button class="btn btn-primary" on:click={() => $modal.open()}>Connect Wallet</button>
		</div>
	{/if}

	{#if $account}
		<div class="mt-6 bg-base-200 rounded-xl p-4 space-y-2">
			{#if deltaChange > 0}
				<p class="text-warning">Difficulty decrease in: {secondsToDayHMS(deltaChange)}</p>
			{/if}
			<p>Total Minted: {$totalMinted}/1024</p>
			<p>User wallet: {$account}</p>
			<p>Current difficulty: {$difficulty}</p>
			<p>Current salt: {$salt}</p>
			<div class="flex items-center gap-2">
				<span>Workers:</span>
				<button class="btn btn-xs" on:click={() => (coresSelected == 1 ? 1 : coresSelected--)}
					>-</button
				>
				<span>{coresSelected}</span>
				<button
					class="btn btn-xs"
					on:click={() => (coresSelected == totalCores ? totalCores : coresSelected++)}>+</button
				>
			</div>
		</div>

		<div class="mt-6 flex gap-2 flex-wrap">
			{#if globalStatus == 'idle'}
				<button class="btn btn-primary" on:click={mineToggle}>Start Mining</button>
			{:else}
				<button class="btn btn-outline btn-error" on:click={mineToggle}>Stop Mining</button>
			{/if}
			<button class="btn btn-outline" on:click={useNonce}>Use a nonce</button>
		</div>
	{/if}

	<div class="mt-8 space-y-4">
		{#each workers as w, i}
			<div class="text-sm font-mono">
				{#if w.hashPerSecond > 0}
					Worker{i} speed: <NumberTween currentNumber={w.hashPerSecond} /> hash/sec
					{#if w.status == 'stop'}
						- <span class="text-error">STOPPED</span>{/if}
				{:else}
					<span class="text-success font-bold">Worker{i} Starting</span>
				{/if}
			</div>
		{/each}
	</div>

	{#if workers.length > 0 && workers[0].hashPerSecond > 0}
		<div class="mt-4 font-mono text-sm">
			Total speed: {Math.floor(totalSpeed / 1000)} KH/s<br />
			Expected time: {secondsToDayHMS(expectedTime)}<br />
			Time elapsed: {secondsToDayHMS(globalElapsed / 1000)}
		</div>
	{/if}

	<div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
		{#each results as data}
			<div class="card bg-base-200 shadow-md">
				<figure>
					<img
						src={`/images/${('0000' + data.buttplug).slice(-4)}.gif`}
						alt="Buttplug {data.buttplug}"
					/>
				</figure>
				<div class="card-body">
					<a href="/buttpluggy/{data.buttplug}" target="_blank" class="card-title"
						>Buttpluggy #{data.buttplug}</a
					>
					<p class="font-mono text-sm overflow-auto">Nonce: {data.nonce}</p>
					{#if data.owner == '0x0000000000000000000000000000000000000000'}
						<button class="btn btn-primary" on:click={() => mintButtplug(data.nonce)}>Mint</button>
					{:else}
						<p class="text-sm text-white/60">
							Already minted by <a
								href={`https://etherscan.io/address/${data.owner}`}
								target="_blank"
								class="link">{data.owner}</a
							>
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	@reference "../../app.css";

	code {
		@apply text-sm bg-base-300 px-1 rounded;
	}
</style>
