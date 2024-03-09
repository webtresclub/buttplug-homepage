<script lang="ts">
import Breadcrumbs from '$lib/Breadcrumbs.svelte';
import {page} from '$app/stores';
import shuffle from '$lib/shuffle.js'

export let data;


$:ids = [...shuffle(data.ids)];

let hovered = 0;

const attr = $page.params.attr;

</script>

<Breadcrumbs>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/attributes">Attributes</a></li>
    <li>{attr}</li>
  </ul>
</Breadcrumbs>

<main class="container py-4">
  <div>
    <h1 class="text-4xl">{attr}</h1>

    <div class="flex flex-grow flex-wrap">
      {#each ids as id}
      <a href="/buttpluggy/{id}" on:mouseenter={() => {hovered = id}} on:mouseleave={() => {hovered = 0}}>
        <img src="{(hovered == id) ? '/images/' : '/images_small/'}{('00000'+id).slice(-4) + ((hovered == id) ? '.gif' : '.png')}" alt="Buttpluggy {id}" class="p-1 h-16 w-16 block" />
      </a>
      {/each}
    </div>
  </div>
</main>
