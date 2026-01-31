<script lang="ts">
	import { contractState, mint, ownerOf } from '$lib/contracts.svelte'; // Updated import
	import { walletState } from '$lib/store.svelte'; // Updated import
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

	let globalStatus = $state('idle');
	let workers: WorkerData[] = $state([]);
	let results: MiningResult[] = $state([]);

	let totalCores = $state(1);
	let coresSelected = $state(1);

	let totalSpeed = $state(0);
	let expectedTime = $state(0);

	let globalStart: number;
	let globalElapsed = $state(0);
	let deltaChange = $state(0);
	let intervalCount: ReturnType<typeof setInterval>;

	// Derived calculations
	$effect(() => {
		if (contractState.totalMinted && contractState.chainTimestamp && contractState.difficulty) {
			const changeDate =
				(contractState.totalMinted -
					(contractState.difficulty - 5n) * (contractState.difficulty - 5n) +
					1n) *
					86400n +
				1708108000n;
			deltaChange = Number(changeDate) - Number(contractState.chainTimestamp);
		}
	});

	$effect(() => {
		if (workers.length > 0 && workers[0].hashPerSecond > 0 && contractState.difficulty > 0) {
			totalSpeed = workers.reduce((total, w) => total + w.hashPerSecond, 0);
			expectedTime = Math.pow(16, Number(contractState.difficulty)) / Math.floor(totalSpeed);
		}
	});

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

	$effect(() => {
		if (walletState.loadReady) {
			contractState.currentDifficultyAndSalt();
			contractState.getTimestamp();
		}
	});

	onMount(() => {
		totalCores = navigator.hardwareConcurrency;
		coresSelected = Math.ceil(totalCores / 2);

		const reloadInterval = setInterval(() => {
			contractState.currentDifficultyAndSalt();
		}, 1000 * 60); // every minute just in case

		const intervalTimestamp = setInterval(() => {
			if (contractState.chainTimestamp > 0n)
				contractState.chainTimestamp = contractState.chainTimestamp + 1n;
		}, 1000); // every second

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
					[walletState.account as `0x${string}`, contractState.salt as `0x${string}`, nonce]
				)
			);
			const hashNumber = BigInt(hash);
			const expectedHash =
				'0x' + '0'.repeat(parseInt(contractState.difficulty as unknown as string));
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

			// results = [...results]; // Not needed with Runes proxy
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
		// workers = [...workers];
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
			// Create a reactive object implicitly by assigning to the array via push or direct index
			// But for array updates to trigger UI in Svelte 5, direct assignment or mutation of state property works.

			const workerData: WorkerData = {
				worker: worker,
				status: 'init',
				start: 0,
				end: 0,
				loops: 0,
				hashPerSecond: 0
			};
			workers[i] = workerData;

			worker.onmessage = function (event: MessageEvent<WorkerResult>) {
				workers[i].status = event.data.status || '';

				workers[i].start = workers[i].start || Date.now();

				worker.onmessage = async function (event: MessageEvent<{ results: WorkerResult }>) {
					if (event.data.results.nonce) {
						console.log('Worker' + i, event.data.results);
						const buttpluggyId = (BigInt('0x' + event.data.results.hash) % 1024n) + 1n;
						const owner = await ownerOf(buttpluggyId);
						foundNonce(event.data.results, owner);
						if (owner == '0x0000000000000000000000000000000000000000') {
							doStop();
							clearInterval(intervalCount);
							return;
						}
						setTimeout(() => {
							startMining();
						}, 100);
					}
					workers[i].loops += 1;
					workers[i].hashPerSecond = Math.floor(
						(workers[i].loops * 1000000) / ((Date.now() - workers[i].start) / 1000)
					);
					console.log('Worker' + i + ', hash/sec:', workers[i].hashPerSecond);
					workers[i].end = 0;

					// loop
					worker.postMessage({
						wallet: (walletState.account as `0x${string}`).slice(2),
						salt: (contractState.salt as `0x${string}`).slice(2),
						difficulty: Number(contractState.difficulty)
					});
				};

				worker.postMessage({
					wallet: (walletState.account as `0x${string}`).slice(2),
					salt: (contractState.salt as `0x${string}`).slice(2),
					difficulty: Number(contractState.difficulty)
				});
			};
		}
		// workers = [...workers];
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
		// results = [...results];
	}

	$effect(() => {
		if (deltaChange > 0) {
			secondsToDayHMS(deltaChange);
		}
	});
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
			<code>bytes32</code> hash starting with <strong>{contractState.difficulty}</strong> zeroes.
		</p>
	</div>

	{#if !walletState.account}
		<div class="mt-12 flex justify-center">
			<button
				class="btn btn-primary btn-lg shadow-xl shadow-primary/20"
				onclick={() => walletState.modal?.open()}>Connect Wallet to Mine</button
			>
		</div>
	{/if}

	{#if walletState.account}
		<div
			class="stats stats-vertical lg:stats-horizontal shadow-xl w-full bg-base-200 mt-8 border border-base-300"
		>
			<div class="stat">
				<div class="stat-title">Total Minted</div>
				<div class="stat-value text-primary">{contractState.totalMinted}/1024</div>
				{#if deltaChange > 0}
					<div class="stat-desc text-warning">Diff drop in {secondsToDayHMS(deltaChange)}</div>
				{/if}
			</div>

			<div class="stat">
				<div class="stat-title">Current Difficulty</div>
				<div class="stat-value">{contractState.difficulty}</div>
				<div class="stat-desc font-mono text-xs truncate max-w-[10rem]">
					Salt: {contractState.salt}
				</div>
			</div>

			<div class="stat">
				<div class="stat-title">Workers</div>
				<div class="stat-value flex items-center gap-3">
					<button
						class="btn btn-sm btn-circle btn-ghost"
						onclick={() => (coresSelected == 1 ? 1 : coresSelected--)}>-</button
					>
					<span>{coresSelected}</span>
					<button
						class="btn btn-sm btn-circle btn-ghost"
						onclick={() => (coresSelected == totalCores ? totalCores : coresSelected++)}>+</button
					>
				</div>
				<div class="stat-desc">Targeting {coresSelected} cores</div>
			</div>
		</div>

		<div class="mt-8 flex gap-4 justify-center">
			{#if globalStatus == 'idle'}
				<button class="btn btn-primary btn-lg w-full max-w-xs" onclick={mineToggle}
					>Start Mining</button
				>
			{:else}
				<button class="btn btn-error btn-outline btn-lg w-full max-w-xs" onclick={mineToggle}
					>Stop Mining</button
				>
			{/if}
			<button class="btn btn-ghost" onclick={useNonce}>Manual Nonce</button>
		</div>
	{/if}

	<div class="mt-8 space-y-4">
		{#each workers as w, i}
			<div
				class="flex items-center justify-between bg-base-200 px-4 py-2 rounded-lg font-mono text-sm"
			>
				<span class="opacity-70">Worker #{i}</span>
				{#if w.hashPerSecond > 0}
					<span><NumberTween currentNumber={w.hashPerSecond} /> H/s</span>
					{#if w.status == 'stop'}
						<span class="badge badge-error">STOPPED</span>
					{/if}
				{:else}
					<span class="text-success animate-pulse">Starting...</span>
				{/if}
			</div>
		{/each}
	</div>

	{#if workers.length > 0 && workers[0].hashPerSecond > 0}
		<div class="alert shadow-lg mt-6 bg-base-100 border border-base-200">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-info shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<div class="flex flex-col sm:flex-row gap-4 w-full justify-between items-center font-mono">
				<span>Total Speed: <span class="font-bold">{Math.floor(totalSpeed / 1000)} KH/s</span></span
				>
				<span>Expected Time: {secondsToDayHMS(expectedTime)}</span>
				<span>Elapsed: {secondsToDayHMS(globalElapsed / 1000)}</span>
			</div>
		</div>
	{/if}

	<div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
		{#each results as data}
			<div class="card card-compact bg-base-100 shadow-xl border border-base-content/10">
				<figure class="p-4 bg-base-content/5">
					<img
						src={`/images/${('0000' + data.buttplug).slice(-4)}.gif`}
						alt="Buttplug {data.buttplug}"
						class="rounded-lg shadow-sm"
					/>
				</figure>
				<div class="card-body">
					<a
						href="/buttpluggy/{data.buttplug}"
						target="_blank"
						class="card-title text-sm hover:text-primary transition-colors"
						>Buttpluggy #{data.buttplug}</a
					>
					<div class="font-mono text-xs opacity-60 truncate">Nonce: {data.nonce}</div>
					{#if data.owner == '0x0000000000000000000000000000000000000000'}
						<button
							class="btn btn-primary btn-sm w-full mt-2"
							onclick={() => mintButtplug(data.nonce)}>Mint Now</button
						>
					{:else}
						<div class="text-xs text-base-content/50 mt-2">
							Owned by <a
								href={`https://etherscan.io/address/${data.owner}`}
								target="_blank"
								class="link hover:text-primary"
								>{(data.owner || '').slice(0, 6) + '...' + (data.owner || '').slice(-4)}</a
							>
						</div>
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
