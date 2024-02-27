<script lang="ts">
	import { currentDifficultyAndSalt, difficulty, salt, mint } from '$lib/contracts';
	import { loadReady, modal, account } from '$lib/store';
	import { keccak256, encodePacked, hashDomain } from 'viem';
	import { onMount } from 'svelte';


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
		expectedTime = Math.pow(16, Number($difficulty)) / Math.floor(totalSpeed)
	}

	function secondsToDayHMS(d) {
		d = Number(d);
		var days = Math.floor(d / 86400);
		var h = Math.floor(d % 86400 / 3600);
		var m = Math.floor(d % 86400 % 3600 / 60);
		var s = Math.floor(d % 86400 % 3600 % 60);

		var dDisplay = days > 0 ? days + (days == 1 ? " day, " : " days, ") : "";
		var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
		var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
		var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
		return hDisplay + mDisplay + sDisplay; 
	}

	$: if($loadReady) {
		currentDifficultyAndSalt();
	}

	onMount(async () => {
		totalCores = navigator.hardwareConcurrency;
		coresSelected = Math.ceil(totalCores / 2);
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
			// @todo CHECK THAT THE BUTTPLUGGY IS NOT ALREADY MINTED
			globalStatus = 'idle';
			results.push({
				nonce,
				buttplug: (hashNumber % 1024n) + 1n
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
		workers.forEach(w => { w.worker.terminate(); w.status='stop'; });
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
        workers[i] = {worker: worker, status: 'init', start: 0, end: 0, loops: 0, hashPerSecond: 0};

        let time;

        worker.onmessage = function(event) {
          // console.log('Worker' + i, event.data.status);
          workers[i].status = event.data.status;

          workers[i].start = workers[i].start || Date.now();

          worker.onmessage = function(event) {
            if (event.data.results.nonce) {
							console.log('Worker' + i, event.data.results);
							foundNonce(event.data.results);
              doStop();
							clearInterval(intervalCount);
							return;
            }
						workers[i].loops += 1;
            workers[i].hashPerSecond = Math.floor( (workers[i].loops * 1000000) / ((Date.now() - workers[i].start) / 1000))
            console.log("Worker"+i+", hash/sec:", workers[i].hashPerSecond);
            workers[i].end = 0;

            // loop
            worker.postMessage({
              wallet: $account.slice(2),
              salt: $salt.slice(2),
              difficulty: Number($difficulty)
            });
          }

          worker.postMessage({
              wallet: $account.slice(2),
              salt: $salt.slice(2),
              difficulty: Number($difficulty)
            });    
        };        
      }
      workers = [...workers];
	}

	function foundNonce({nonce, hash}) {
		console.log('Found nonce', nonce, hash);
		nonce = BigInt('0x'+nonce);
		hash = BigInt('0x'+hash);
		console.log(hash, (hash % 1024n) + 1n);
		
		// @todo CHECK THAT THE BUTTPLUG IS NOT ALREADY MINTED
		doStop();	
		results.push({
			nonce,
			buttplug: (hash % 1024n) + 1n
		});
		results = [...results];
	}
</script>

<main class="container">
	<article class="bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
      <h1 class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl  dark:text-white">
        Mine your Buttpluggy
      </h1>
      <p class="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400">
          You must find a nonce that when encrypting it with your wallet address and a salt through <code class="display-inline!important">keccak256(encodePacked(YOUR_WALLET,SALT,NONCE))</code>
					results in a <code>bytes32</code> hex that starts with {$difficulty} zeroes.
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
            <br class="mt-6 p-4 mx-auto text-left font-mono">  
							User wallet: {$account}<br />
							Current difficulty: {$difficulty}<br />
							Current salt: {$salt}<br />
							<!-- Min 1 worker Max cores.length-->
							<div class="flex  items-center mx-auto mb-1">
								Workers:
								<span on:click={() => (coresSelected == 1 ? 1 : coresSelected--)} class="core-button">-</span>
								{coresSelected}
								<span on:click={() => (coresSelected == totalCores ? totalCores : coresSelected++)} class="core-button">+</span>
							</div>
						<br/>
							{#if globalStatus == 'idle'}
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
      
			
			{#each workers as w, i}
				<div class="font-mono">
					{#if w.hashPerSecond > 0}
						Worker{i} speed: {w.hashPerSecond} hash/sec
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
					Expect to mine one in {secondsToDayHMS(expectedTime)} (aprox based con current hashrate)<br />
					Time elapsed: {secondsToDayHMS(globalElapsed / 1000)}
				</div>	
			{/if}
			
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
