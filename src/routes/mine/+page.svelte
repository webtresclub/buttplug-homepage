<script lang="ts">
	import { currentDifficultyAndSalt, difficulty, salt, mint } from '$lib/contracts';
	import { loadReady, modal, account } from '$lib/store';
	import { keccak256, encodePacked } from 'viem';
	import { onMount } from 'svelte';

	let status = 'idle';

	let cores = [1];

	$: if($loadReady) {
		currentDifficultyAndSalt();
	}

	onMount(async () => {
		for (var i = 1; i < navigator.hardwareConcurrency; i++) {
			cores.push(i + 1);
		}
		cores = [...cores];		
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
	

	<article>
		<h3>Here you can mine a Buttplug</h3>
		{#if !$account}
			<p>First connect your wallet</p>
			<button
				on:click={() => { modal.open() }}
				class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
			>Connect</button>
		{:else}
			<div class="font-mono">
				Current difficulty: {$difficulty}<br />
				Current salt: {$salt}<br />
			</div>
			<!-- Change amount of workers with a plus and minus button-->
			<!-- Min 1 worker Max cores.length-->
			<div class="font-mono mb-2">
				<div class="flex items-center">
					Workers:
					<span on:click={() => (coresSelected == 1 ? 1 : coresSelected--)} class="core-button">-</span>
					 {coresSelected}
					<span on:click={() => (coresSelected == cores.length ? cores.length : coresSelected++)} class="core-button"
						>+</span
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
					Buttplugy id: {data.buttplug} - Nonce: {data.nonce}
					<img
						src="/images/{data.buttplug}.gif"
						class="w-52 h-52"
						alt="Buttplug {data.buttplug}"
					/>
				</div>
				<button
					class="btn"
					on:click={() => {
						mintButtplug(data.nonce);
					}}>Mint Buttplugy #{data.buttplug}</button
				>
				<hr />
			{/each}
		{/if}
	</article>
</main>
<style>
	.core-button{
		@apply rounded border border-slate-500 w-6 h-6 text-center mx-1 cursor-pointer select-none;
	}
	.core-button:hover{
		@apply bg-slate-500 text-white;
	}

</style>