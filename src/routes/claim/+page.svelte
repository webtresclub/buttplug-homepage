<script lang="ts">
import { connectMetamask, account, chain} from '$lib/user.store';
import {haveClaimButtplug, mintWithMerkle} from '$lib/contracts';

export let data;

let canClaim = false;
$: proof = ($account && data && data.wallets && data.wallets[$account.toLowerCase()]) || [];
$: if (proof.length > 0) {
        haveClaimButtplug($account).then((claimed) => {
            canClaim = !claimed;
        });
}

async function claim() {
    try {
        await mintWithMerkle(proof)
        alert('Claimed');
    } catch(e) {
        alert(e.message);
    }
}
</script>

<main class="container">

    <section class="bg-white dark:bg-gray-900">
        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Claim yout buttplug</h1>
            <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
                Here you can claim your Buttplug without mine it, but you must have been preselected (by having at least two community poaps)
            </p>
            <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                {#if !$account}
                    <p>First connect your wallet</p>
                    <button on:click={() => connectMetamask()} class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                        Connect
                        <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                {:else if $chain != '1'}
                    <h1>{$chain} Switch network to Ethereum mainnet</h1>
                {:else}
                    <button on:click={claim} disabled={!canClaim} class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                        Claim it here
                        <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                    <a href="/mine" class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                        Mine your Buttplug
                    </a>  
                {/if}
            </div>
            <div class="mt-6 p-4 mx-auto text-center font-mono">
                Minter contract <a href="https://goerli.etherscan.io/address/0x262C5ea7411B0FAdB8E175C8D994A2Fd08274C31" target="_blank">0x262C5ea7411B0FAdB8E175C8D994A2Fd08274C31</a>
            </div>
        </div>
    </section>
</main>
