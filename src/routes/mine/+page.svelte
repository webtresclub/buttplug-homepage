<script lang="ts">
	import { onMount } from 'svelte';
	import { currentDifficultyAndSalt, difficulty, salt, getConfigWagmi, mint } from '$lib/contracts';
	import { connectMetamask, account, chain } from '$lib/user.store';
	import { keccak256, encodePacked } from 'viem';

	let status = 'idle';

	let miningHardware = 1;
	let cores = [1];

	onMount(async () => {
		// this will init wagmi
		await getConfigWagmi();
		miningHardware = navigator.hardwareConcurrency;
		for (var i = 1; i < navigator.hardwareConcurrency; i++) {
			cores.push(i + 1);
		}
		cores = [...cores];

		const unwatch = currentDifficultyAndSalt();
		return unwatch;
	});

	let coresSelected = 4;

	let workers = [];
	function terminateWorkers() {
		workerLog = [];
		workers.map(function (w) {
			w.terminate();
		});
		workers = [];
	}

	function mineToggle() {
		if (status == 'mining') {
			status = 'idle';
			terminateWorkers();
		} else {
			startMining();
		}
	}

	async function miningComplete(result) {
		if (result[1] == -1) {
			startMining();
		} else {
			status = 'idle';
			console.log('Complete', result);
		}
	}

	let results = [];
	let workerLog = [];

	function startMining() {
		status = 'mining';
		const mineButtplug = createMiner();
		mineButtplug(coresSelected, miningComplete);
	}

	async function mintButtplug(nonce) {
		try {
			await mint(nonce);
			alert('Minted');
		} catch (e) {
			alert(e.message);
		}
	}

	function createMiner() {
		return function mine(workerCount, handleResult) {
			workerCount = workerCount || 1;
			terminateWorkers();
			workers = [];
			for (let i = 0; i < workerCount; i++) {
				const w = new Worker('/js/mine-worker.js');
				w.onmessage = (e) => {
					const response = JSON.parse(e.data);
					console.log(response);
					if (response[1] != -1) {
						const nonce = BigInt(response[0]);
						const message = BigInt(
							keccak256(encodePacked(['address', 'bytes32', 'uint256'], [$account, $salt, nonce]))
						);
						console.log(message, (message % 1024n) + 1n);
						// @todo CHECK THAT THE BUTTPLUG IS NOT ALREADY MINTED
						status = 'idle';
						results.push({
							nonce,
							buttplug: (message % 1024n) + 1n
						});
						results = [...results];
						terminateWorkers();
					} else {
						handleResult(response);
						workerLog[i] = response[4];
					}
				};
				workers.push(w);
				w.postMessage({ $difficulty, $salt, $account });
			}
		};
	}
</script>

<main class="container">
	<h3>Here you can mine a Buttplug</h3>

	<article>
		{#if !$account}
			<p>First connect your wallet</p>
			<button
				on:click={() => connectMetamask()}
				class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
			>
				Connect
				<svg
					class="w-3.5 h-3.5 ml-2"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 14 10"
				>
					<path
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M1 5h12m0 0L9 1m4 4L9 9"
					/>
				</svg>
			</button>
		{:else if $chain != '5'}
			<h1>{$chain} Switch network to sepolia</h1>
		{:else}
			<div class="font-mono">
				Current difficulty: {$difficulty}<br />
				Current salt: {$salt}<br />
			</div>
			<!-- Change amount of workers with a plus and minus button-->
			<!-- Min 1 worker Max cores.length-->
			<div class="font-mono">
				<div class="flex items-center">
					Workers:
					<spam on:click={() => (coresSelected == 1 ? 1 : coresSelected--)}>-</spam>
					{coresSelected}
					<spam on:click={() => (coresSelected == cores.length ? cores.length : coresSelected++)}
						>+</spam
					>
				</div>
			</div>

			{#each workerLog as l}
				<div class="font-mono">
					Worker speed: {l}
				</div>
			{/each}

			<button class="btn" on:click={mineToggle}>
				{#if status == 'mining'}
					Stop mining
				{:else}
					Start mining
				{/if}
			</button>

			{#each results as data}
				<div class="font-mono">
					Buttplug id: {data.buttplug} - Nonce: {data.nonce}
					<img
						src="https://bafybeibnw2yuc7tpkt4pkzx3c2yizyjx24vioehwqodxppbqoyncyi4t44.ipfs.dweb.link/{data.buttplug}.gif"
						alt="Buttplug {data.buttplug}"
					/>
				</div>
				<button
					class="btn"
					on:click={() => {
						mintButtplug(data.nonce);
					}}>Mint Buttplug {data.buttplug}</button
				>
				<hr />
			{/each}
		{/if}
	</article>
</main>
