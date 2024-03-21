<script lang="ts">
import Breadcrumbs from '$lib/Breadcrumbs.svelte';
import {page} from '$app/stores';
import slugify from 'slug';

export let data;


const id = $page.params.id;

</script>


<svelte:head>
	<!-- HTML Meta Tags -->
	<title>Buttpluggy #{id} - {data.buttplug.name}</title>
	<meta name="description" content="{data.buttplug.description}">

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content="https://www.buttpluggy.com/buttpluggy/{id}">
	<meta property="og:type" content="website">
	<meta property="og:title" content="Buttpluggy #{id} - {data.buttplug.name}">
	<meta property="og:description" content="{data.buttplug.description}">
	<!--
	You can generate this image URL dynamically: https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/{site_text}/{title_text}/{image_url}/og.png
	Replace the variables in the brackets with your own values and use this URL in the image tag below this comment. Ensure values are URL encoded.
	For more information, read: https://www.opengraph.xyz/blog/how-to-implement-dynamic-open-graph-images
	-->
	<meta property="og:image" content="https://www.buttpluggy.com/images_small/{('00000'+id).slice(-4)}.png">

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image">
	<meta property="twitter:domain" content="buttpluggy.com">
	<meta property="twitter:url" content="https://www.buttpluggy.com/buttpluggy/{id}">
	<meta name="twitter:title" content="Buttpluggy #{id} - {data.buttplug.name}">
	<meta name="twitter:description" content="{data.buttplug.description}">
	<meta name="twitter:image" content="https://www.buttpluggy.com/images_small/{('00000'+id).slice(-4)}.png">

	<!-- Meta Tags Generated via https://www.opengraph.xyz -->
</svelte:head>

<Breadcrumbs>
  <ul>
    <li><a href="/">Home</a></li>
    <li>Buttpluggy #{id}</li>
  </ul>
</Breadcrumbs>


<div class="w-full flex flex-col md:flex-row mt-2 mx-auto w-full md:max-w-2xl">
    <div class="w-full sm:max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <img class="rounded-t-lg w-full" src="/images/{('00000'+id).slice(-4)}.gif" alt="" />
        <div class="p-5">
                <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    ButtPluggy {id}
                </h2>
            <h3 class="mb-2 text-lg tracking-tight text-gray-900 dark:text-white">
                Attributes
            </h3>
            <div>
            {#each data.buttplug.attributes as a }
                <div class="flex items-center border-t py-1">
                    <div class="px-4">✔️</div>
                    <div class="">
                        <a href="/attributes/{slugify(a.trait_type+'-'+a.value)}" class="font-bold hover:cursor hover:text-white hover:underline">{a.trait_type}: {a.value}</a><br />
                        {data.grouped[a.trait_type+'-'+a.value]} buttpluggies have this trait.
                    </div>
                </div>
            {/each}
            </div>
            <!--
            <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Read more
                <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
            </a>
            -->
        </div>
    </div>
    <div class="w-full p-4 md:pl-8">
        <h5 class="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {data.buttplug.name}    
        </h5>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {data.buttplug.description}    
            </p>
    </div>
</div>




