<script lang="ts">
import { modal } from "$lib/store";
import { account, loadReady } from "../lib/store";
import { haveClaimButtplug } from '$lib/contracts';

export let data;

import { onMount } from "svelte";


let userOnMerkle = false;
let randomIds = [];
let traits = {};

async function fetchData(ids) {
    const response = await fetch('/api/names', {
      method: 'POST',
      body: ids,
      headers: {
        'content-type': 'application/json'
      }
    });

    return await response.json();
}

onMount(async () => {
    for(let i = 0; i < 6; i++) {
        randomIds.push(
            Math.floor(Math.random() * 1024) + 1
        );
    }
    randomIds = [...new Set(randomIds)];
    traits = await fetchData(JSON.stringify(randomIds));
});


let canClaim = false;
$: if ($account && $loadReady) {
    // lets see if current wallet is on the merkle tree
    userOnMerkle = data.wallets.indexOf($account.toLowerCase()) > -1;
    // if user is on merkle tree, lets see if he can claim (he could already claimed, only one per wallet)
    if (userOnMerkle) {
        haveClaimButtplug($account).then((result) => {
            // if result is false, user have not claimed yet, so he can claim
            canClaim = !result;
        });
    }
}

</script>

    <svelte:head>
        <!-- HTML Meta Tags -->
        <title>Buttplugs, a Huff powered NFT pixel art collection</title>
        <meta name="description" content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!">

        <!-- Facebook Meta Tags -->
        <meta property="og:url" content="https://www.buttpluggy.com/">
        <meta property="og:type" content="website">
        <meta property="og:title" content="Buttplugs, a Huff powered NFT pixel art collection">
        <meta property="og:description" content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!">
        <!--
        You can generate this image URL dynamically: https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/{site_text}/{title_text}/{image_url}/og.png
        Replace the variables in the brackets with your own values and use this URL in the image tag below this comment. Ensure values are URL encoded.
        For more information, read: https://www.opengraph.xyz/blog/how-to-implement-dynamic-open-graph-images
        -->
        <meta property="og:image" content="https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/buttpluggy.com/Buttplugs%2C%20a%20Huff%20powered%20NFT%20collection/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fdocuments%2F987f816e-a24f-4e2d-affa-8c4fed634f39.png%3Ftoken%3D8J3BbdhXhFu2Y5rAHyj5GnRZsks-yyeeFluAFll4JLM%26height%3D1200%26width%3D1200%26expires%3D33247040340/og.png">

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta property="twitter:domain" content="buttpluggy.com">
        <meta property="twitter:url" content="https://www.buttpluggy.com/">
        <meta name="twitter:title" content="Buttplugs, a Huff powered NFT pixel art collection">
        <meta name="twitter:description" content="Explore Buttplug NFTs, a unique collection of 1,024 oscilloscope visuals on Ethereum, crafted by the Webtr3s community. Mine yours today!">
        <meta name="twitter:image" content="https://ogcdn.net/e4b8c678-7bd5-445d-ba03-bfaad510c686/v3/buttpluggy.com/Buttplugs%2C%20a%20Huff%20powered%20NFT%20collection/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fdocuments%2F987f816e-a24f-4e2d-affa-8c4fed634f39.png%3Ftoken%3D8J3BbdhXhFu2Y5rAHyj5GnRZsks-yyeeFluAFll4JLM%26height%3D1200%26width%3D1200%26expires%3D33247040340/og.png">

        <!-- Meta Tags Generated via https://www.opengraph.xyz -->
    </svelte:head>

    <div class="hero" data-theme="dark">
        <div class="text-justify p-8 mx-auto max-w-4xl">
            <p class="text-lg mb-6">
                <span class="font-semibold">1024</span> unique collectible oscilloscope visuals with proof of 
                ownership preserved on the Ethereum blockchain. Presented by the <b>WebtrES</b> community, the 
                Buttpluggy (huffplug) project is a trailblazer in the next chapter of CryptoArt evolution. 
            </p>
            <p class="text-lg mb-6">
            As one of the pioneering projects utilizing the <span class="font-semibold">Huff</span> programming 
            language, Buttpluggy stand as a testament to innovation and craftsmanship in the world of 
            "Non-Fungible Tokens". Meticulously designed with the <span class="font-semibold">Huffmate</span> 
            libraries, these tokens represent a fusion of artistry and technical prowess. 
            </p>
            <p class="text-lg mb-6">
            Since their inception by the Spanish-speaking hacker collective, Buttpluggy have garnered attention 
            and admiration. Paying homage to the traditions set by iconic predecessors like CryptoPunks, while 
            also setting new standards and benchmarks, they are a must-have in any digital art enthusiast's 
            collection.
            </p>
            <p class="text-lg">
            Join us in this journey as we redefine the boundaries of art and technology, one Buttpluggy at a time.
            </p>
            <div>
            {#if !$loadReady}
                <!-- <p>Loading wallect connect...</p>-->
            {:else if !$account}
                <p>First connect your wallet</p>
                <button on:click={() => { $modal.open() }}
				class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">Connect</button>
            {:else}
                {#if userOnMerkle && canClaim}
                    <span class="text-xl font-bold">
                        Congratulations, you are in the merkle tree and can mint without mining:
                    </span><br />
                {/if}

                <div class="flex items-center">   
                    <a href="/mine" role="button">Mine your Buttpluggy</a>
                    <a href="/claim" class="ml-2" class:opacity-50={!canClaim} class:cursor-not-allowed={!canClaim} role="button">Claim</a>
                    <a href="/gallery" class="ml-2" role="button">Your Buttpluggies</a>
                    <a href="/attributes" class="ml-2" role="button">Gallery</a>
                </div>
            {/if}
        </div>
    </div>
</div>

<hr />
<main class="container">
    {#if randomIds.length}
        <h3>These are some of our finest Buttpluggies</h3>

        <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
            {#each randomIds as id }
                <div class="card mx-auto">
                    <div class="card__image">
                        <a href="/buttpluggy/{id}">
                            <img width="276" height="276" src="/images/{('00000'+id).slice(-4)}.gif" alt={traits[String(id)]} />
                        </a>
                    </div>
                    <div class="card__content">
                        <h3>Buttplugy #{id}</h3>
                        <!--<small>{traits[String(id)]}</small>-->
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <hr />
    <article>
        <div class=" p-8 mx-auto max-w-4xl">

          <h2 class="text-2xl font-bold mb-4">What is a Buttplug?</h2>
          <p class="text-lg mb-6">
              Buttpluggies are intricate visual representations of oscilloscopes, shaped by algorithmic 
              designs. While many display complex waveform patterns, some unique Buttplugs showcase 
              unique aesthetics, influenced by digital artistry and the hacker spirit. Each one 
              has a distinct profile page detailing its features, ownership, and sale status.
          </p>
          
          <h2 class="text-2xl font-bold mb-4">What's the background?</h2>
          <p class="text-lg mb-6">
            While cryptocurrencies like Bitcoin revolutionized digital transactions, Ethereum expanded 
              these possibilities by allowing immutable, decentralized execution of complex code. This 
              innovation powers our Buttpluggies. Developed on Ethereum using the Huff programming language 
              and the Huffmate libraries, the Buttpluggy contract provides a transparent and trustless 
              method to trade and own these unique tokens. The code is not just stored; it’s brought to 
              life on the blockchain, ensuring everyone can validate its fair execution.
          </p>
          <h2 class="text-2xl font-bold mb-4">How do I acquire a Buttpluggy?</h2>
<ul class="text-lg mb-6 list-disc pl-8">
    <li>Start by downloading and setting up a Web3 browser extension, such as MetaMask. This will connect websites (upon your 
        authorization) to your Ethereum wallet.</li>
    <li>If it's a new account, make sure to purchase some $ETH. MetaMask provides an easy way to buy $ETH from platforms 
        like Coinbase.</li>
    <li>If you possess two or more POAPs from the WebtrES community, you might be whitelisted to mint a Buttpluggy directly. 
        Check your eligibility on our platform.</li>
    <li>Alternatively, you can also mine a Buttpluggy. The minting process involves generating a nonce that, when hashed, meets 
        specific criteria (like a prefixed number of zeros). The difficulty for this task varies, based on the days elapsed 
        since the contract deployment and the number of Buttplugs already minted, making it similar to the MoonCats rescue 
        mechanism.</li>
    <li>Once the extension is active and you've verified your eligibility or mined a Buttpluggy, our website will provide interfaces 
        enabling you to bid, buy, or sell Buttplugs seamlessly.</li>
</ul>

          
          <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          
          <h3 class="text-xl mb-3">Where are the visuals for the Buttplugs stored?</h3>
          <p class="text-lg mb-6">
            The visuals for the Buttplugs are stored on the InterPlanetary File System (IPFS), a decentralized and distributed file 
            system. By leveraging IPFS, we ensure that each Buttpluggy visual is permanently accessible, resistant to censorship, and 
            not reliant on any single point of failure. Users can easily retrieve and verify their Buttpluggy visuals from IPFS at any time.
          </p>
          
          <h3 class="text-xl mb-3">Are Buttplugs ERC-721 tokens?</h3>
          <p class="text-lg mb-6">
              Absolutely! Buttplugs are minted as ERC-721 tokens, adhering to the standards that govern most collectible 
              assets on the Ethereum blockchain.
          </p>
          
          <h3 class="text-xl mb-3">Are there any transaction fees?</h3>
          <p class="text-lg mb-6">
              No additional fees are levied for Buttpluggy transactions through our integrated marketplace. However, standard 
              Ethereum gas fees will apply.
          </p>
          
          <p class="text-lg mb-6">
              For more insights into the technical specifics, feel free to explore the contract and its associated code 
              on <a href="https://github.com/webtresclub/huffplug" class="underline text-blue-500" target="_blank">Github</a>. For 
              further inquiries, drop us an email at buttplugs@webtrES.io
          </p>          
        </article>
</main>
