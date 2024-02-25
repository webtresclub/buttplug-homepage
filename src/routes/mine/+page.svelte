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


	function useNonce() {
		const _nonce = prompt('Enter the nonce (hexa or number) to mint the buttplug:');
		if (_nonce) {
			const nonce = BigInt(_nonce);
			const hash = keccak256(encodePacked(['address', 'bytes32', 'uint256'], [$account, $salt, nonce]))
			const hashNumber = BigInt(hash);
			const expectedHash = '0x'+'0'.repeat(parseInt($difficulty));
			if (!hash.startsWith(expectedHash)) {
				alert('The nonce is not valid, hash not starts with ' + expectedHash + ' - current hash: ' + hash);
				return;
			}
			// @todo CHECK THAT THE BUTTPLUG IS NOT ALREADY MINTED
			status = 'idle';
			results.push({
				nonce,
				buttplug: (hashNumber % 1024n) + 1n
			});



			results = [...results];
			// mintButtplug(BigInt(nonce));
		}
	}

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
						workerLog = [...workerLog];
					}
				};
				workers.push(w);
				w.postMessage({ $difficulty, $salt, $account });
			}
		};
	}
</script>

<main class="container">
	<article class="bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
      <h1 class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl  dark:text-white">
        Mine your Buttpluggy
      </h1>
      <p class="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400">
          You must find a nonce that when doing <code class="display-inline!important">keccak256(encodePacked(YOUR_WALLET,SALT,NONCE))</code>
					you have to get a <code>bytes32</code> hex start with the same amount of ceros as difficulty.
      </p>
      <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                {#if !$account}
                    <p>First connect your wallet</p>
                    <button on:click={() => { $modal.open() } } class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                        Connect
                    </button>
                {/if}
            </div>
						<hr />
            <div class="mt-6 p-4 mx-auto text-left font-mono">  
							User wallet: {$account}<br />
							Current difficulty: {$difficulty}<br />
							Current salt: {$salt}<br />
							<!-- Min 1 worker Max cores.length-->
							<div class="flex  items-center mx-auto mb-1">
								Workers:
								<span on:click={() => (coresSelected == 1 ? 1 : coresSelected--)} class="core-button">-</span>
								{coresSelected}
								<span on:click={() => (coresSelected == cores.length ? cores.length : coresSelected++)} class="core-button">+</span>
							</div>
							{#if status == 'idle'}
								<button on:click={() => { mineToggle() } } class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
									Start mine
								</button>
							{:else}
								<button on:click={() => { mineToggle() } } class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
									Stop mining
								</button>
							{/if}
							<button on:click={() => { useNonce() } } class="bg-transparent inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
									Use a nonce
								</button>
            </div>
      
			
			{#each workerLog as l}
				<div class="font-mono">
					Worker speed: {l}
				</div>
			{/each}


			{#each results as data}
				<div class="font-mono">
					Buttpluggy id: {data.buttplug} - Nonce: {data.nonce}
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
					}}>Mint Buttpluggy #{data.buttplug}</button
				>
				<hr />
			{/each}
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