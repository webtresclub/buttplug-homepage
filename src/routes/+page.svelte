<script lang="ts">
import { connectMetamask, account, chain} from '$lib/user.store';
import {haveClaimButtplug} from '$lib/contracts';
import { onMount } from 'svelte';
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
$: if ($account && data.wallets.indexOf($account.toLowerCase()) > -1) {
    haveClaimButtplug($account).then((claimed) => {
        canClaim = !claimed;
    });
}


async function fetchData() {
    const response = await fetch('/api/names', {
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
        <h2>A Huff NFT collection</h2>
      </hgroup>
    </header>

    <div class="text-justify p-8 mx-auto max-w-4xl">
      <p class="text-lg mb-6">
          <span class="font-semibold">1024</span> unique collectible oscilloscope visuals with proof of ownership preserved on the Ethereum blockchain. Presented by the <b>WebtrES</b> community, the Buttplug project is a trailblazer in the next chapter of CryptoArt evolution. 
      </p>
      <p class="text-lg mb-6">
          As one of the pioneering projects utilizing the <span class="font-semibold">Huff</span> programming language, Buttplugs stand as a testament to innovation and craftsmanship in the world of "Non-Fungible Tokens". Meticulously designed with the <span class="font-semibold">Huffmate</span> libraries, these tokens represent a fusion of artistry and technical prowess. 
      </p>
      <p class="text-lg mb-6">
          Since their inception by the Spanish-speaking hacker collective, Buttplugs have garnered attention and admiration. Paying homage to the traditions set by iconic predecessors like CryptoPunks, while also setting new standards and benchmarks, they are a must-have in any digital art enthusiast's collection.
      </p>
      <p class="text-lg">
          Join us in this journey as we redefine the boundaries of art and technology, one Buttplug at a time.
      </p>
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
  </div>
  
  
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
                    <h3>#{id} - {traits[String(id)]}</h3>
                </div>
            </div>
        {/each}
        </div>


        <hr />
        <article>

        <div class=" p-8 mx-auto max-w-4xl">

          <h2 class="text-2xl font-bold mb-4">What is a Buttplug?</h2>
          <p class="text-lg mb-6">
              Buttplugs are intricate visual representations of oscilloscopes, shaped by algorithmic 
              designs. While many display complex waveform patterns, some unique Buttplugs showcase 
              unique aesthetics, influenced by digital artistry and the hacker spirit. Each Buttplug 
              has a distinct profile page detailing its features, ownership, and sale status.
          </p>
          
          <h2 class="text-2xl font-bold mb-4">What's the background?</h2>
          <p class="text-lg mb-6">
            While cryptocurrencies like Bitcoin revolutionized digital transactions, Ethereum expanded 
              these possibilities by allowing immutable, decentralized execution of complex code. This 
              innovation powers our Buttplugs. Developed on Ethereum using the Huff programming language 
              and the Huffmate libraries, the Buttplug contract provides a transparent and trustless 
              method to trade and own these unique tokens. The code is not just stored; it’s brought to 
              life on the blockchain, ensuring everyone can validate its fair execution.
          </p>
          
          <h2 class="text-2xl font-bold mb-4">How do I acquire a Buttplug?</h2>
          <h2 class="text-2xl font-bold mb-4">How do I acquire a Buttplug?</h2>
<ul class="text-lg mb-6 list-disc pl-8">
    <li>Start by downloading and setting up a Web3 browser extension, such as MetaMask. This will connect websites (upon your authorization) to your Ethereum wallet.</li>
    <li>If it's a new account, make sure to purchase some $ETH. MetaMask provides an easy way to buy $ETH from platforms like Coinbase.</li>
    <li>If you possess two or more POAPs from the WebtrES community, you might be whitelisted to mint a Buttplug directly. Check your eligibility on our platform.</li>
    <li>Alternatively, you can also mine a Buttplug. The minting process involves generating a nonce that, when hashed, meets specific criteria (like a prefixed number of zeros). The difficulty for this task varies, based on the days elapsed since the contract deployment and the number of Buttplugs already minted, making it similar to the MoonCats rescue mechanism.</li>
    <li>Once the extension is active and you've verified your eligibility or mined a Buttplug, our website will provide interfaces enabling you to bid, buy, or sell Buttplugs seamlessly.</li>
</ul>

          
          <h2 class="text-2xl font-bold mb-4">Frequently Asked Queries</h2>
          
          <h3 class="text-xl mb-3">Where are the visuals for the Buttplugs stored?</h3>
          <p class="text-lg mb-6">
            The visuals for the Buttplugs are stored on the InterPlanetary File System (IPFS), a decentralized and distributed file system. By leveraging IPFS, we ensure that each Buttplug visual is permanently accessible, resistant to censorship, and not reliant on any single point of failure. Users can easily retrieve and verify their Buttplug visuals from IPFS at any time.
          </p>
          
          <h3 class="text-xl mb-3">Are Buttplugs ERC-721 tokens?</h3>
          <p class="text-lg mb-6">
              Absolutely! Buttplugs are minted as ERC-721 tokens, adhering to the standards that govern most collectible assets on the Ethereum blockchain.
          </p>
          
          <h3 class="text-xl mb-3">Are there any transaction fees?</h3>
          <p class="text-lg mb-6">
              No additional fees are levied for Buttplug transactions through our integrated marketplace. However, standard Ethereum gas fees will apply.
          </p>
          
          <p class="text-lg mb-6">
              For more insights into the technical specifics, feel free to explore the contract and its associated code on <a href="#" class="underline text-blue-500">Github</a>. For further inquiries, drop us an email at buttplugs@webtrES.io.
          </p>
          
          
        </article>
</main>
