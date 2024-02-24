<script lang="ts">
import "../app.pcss";
import "@picocss/pico";

import {initWeb3, loadReady } from "../lib/store";

import { onMount } from "svelte";

onMount(() => { initWeb3() });
</script>

<header class="backdrop-blur-md border-b border-b-slate-800" style="background: #0b0d10">
  <div class="container flex justify-between py-2">
    <hgroup class="pt-3">
      <h1 class="text-2xl"><a href="/">Buttplugs <small class="text-xs">(UwU)</small></a></h1>
      <p class="hidden lg:inline"><span class="text-sm">A Huff NFT collection</span></p>
    </hgroup>
    <nav>
      <ul class="text-xs lg:text-sm">
        <li><a href="/mine"><span class="hidden lg:inline">🌱 </span>Mint</a></li>
        <li class="hidden lg:inline"><a href="https://opensea.io/collection/buttpluggy" target="_blank">🌊 OpenSea</a></li>
        <li class="hidden md:inline"><a href="https://github.com/webtresclub/huffplug/tree/main/src" target="_blank">
          <span class="hidden lg:inline">💻 </span>Source Code</a></li>
        <li>{#if loadReady} <w3m-button /> {/if}</li>
      </ul>
    </nav>
  </div>
</header>


<main class="container">
  <slot />
</main>

<style>
  a:hover {
    @apply underline text-slate-100;

  }
</style>