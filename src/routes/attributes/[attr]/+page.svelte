<script lang="ts">
import Breadcrumbs from '$lib/Breadcrumbs.svelte';
import {page} from '$app/stores';
import slugify from 'slug';

export let data;


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
      {#each data.ids as id}
      <a href="/buttpluggy/{id}">
        <img src="/images_small/{('00000'+id).slice(-4)}.png" alt="Buttpluggy {id}" class="p-1" width="64"/>
      </a>
      {/each}
    </div>
  </div>
</main>
