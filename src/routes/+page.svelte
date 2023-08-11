<script lang="ts">
import { connectMetamask, account, chain} from '$lib/user.store';
import { onMount } from 'svelte';
	import Layout from './+layout.svelte';

export let data;
let randomIds = [];
let traits = {};

onMount(async () => {

    for(let i = 0; i < 9; i++) {
        randomIds.push(
            Math.floor(Math.random() * 1024) + 1
        );
    }
    randomIds = [...new Set(randomIds)];
    traits = await fetchData();
});


let canClaim = false;
$: if ($account) {
    canClaim = data.wallets.indexOf($account.toLowerCase()) > -1
    
    // TODO: check if claimed
    canClaim = true;
}


async function fetchData() {
    const response = await fetch('/api/traits', {
      method: 'POST',
      body: JSON.stringify({randomIds}),
      headers: {
        'content-type': 'application/json'
      }
    });

    return await response.json();
}

</script>


<div class="hero" data-theme="dark">
    <nav class="container-fluid">
      <ul>
        <li>
          <a href="/" class="contrast"><strong>Buttplug</strong></a>
        </li>
      </ul>
      <ul>
        <li>
            {#if !$account}
                <a on:click={() => connectMetamask()} class="contrast outline cursor-pointer">Connect</a>
            {:else}
                <a href="#" role="button" class="contrast outline" onclick="event.preventDefault()">{$account.slice(0, 6)}...{$account.slice(-4)}</a>
            {/if}
        </li>
      </ul>
    </nav>
    <header class="container">
      <hgroup>
        <h1>Buttplug</h1>
        <h2>A classy NFT</h2>
      </hgroup>
      <div>
        {#if !$account}
            <p>First connect your wallet</p>
            <button on:click={() => connectMetamask()}>Connect</button>
        {:else if $chain != '5'}
            <h1>{$chain} Switch network to sepolia</h1>
        {:else}
            <a href="/mine" role="button">Mine your Buttplug</a> <br />
            {#if canClaim}
                Contratulations, you are in the merkle tree for mint without mine:<br />
                <a href="/claim" role="button">Claim</a>
            {/if}
        {/if}
      </div>
    </header>
  </div>
  <!-- ./ Hero -->

<main class="container">

    <h3>This are some of our finest Buttplug</h3>
    

    <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
        {#each randomIds as id }
            <div class="card">
                <div class="card__image">
                    <a href="/buttpluggy/{id}">
                        <img width="276" height="276" src="https://bafybeibnw2yuc7tpkt4pkzx3c2yizyjx24vioehwqodxppbqoyncyi4t44.ipfs.dweb.link/{id}.gif" alt={id} />
                    </a>
                </div>
                <div class="card__content">
                    <h3>#{id} - {traits[String(id)].name}</h3>
                </div>
            </div>
        {/each}
</main>
