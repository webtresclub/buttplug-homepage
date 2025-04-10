<script lang="ts">
	import { modal, account, loadReady } from '$lib/store';
	import { haveClaimButtplug, mintWithMerkle } from '$lib/contracts';

	export let data;

	let canClaim = false;
	$: proof = ($account && data?.wallets?.[$account.toLowerCase()]) || [];
	$: if (proof.length > 0 && $loadReady) {
		haveClaimButtplug($account).then((claimed) => {
			canClaim = !claimed;
		});
	}

	async function claim() {
		try {
			await mintWithMerkle(proof);
			alert('🎉 Claimed!');
		} catch (e) {
			alert(e.message);
		}
	}
</script>

<main class="hero min-h-screen bg-base-100">
	<div class="hero-content text-center max-w-2xl">
		<div class="w-full">
			<h1 class="text-5xl font-bold text-primary mb-4">Claim your Buttpluggy</h1>
			<p class="text-base-content/70 text-lg mb-6">
				If you're on the whitelist, you can claim your Buttpluggy without mining. You need at least
				<a
					href="https://github.com/webtresclub/huffplug/tree/main/merkletree-builder#readme"
					target="_blank"
					class="underline text-secondary hover:text-secondary-focus"
				>
					two WebtrES POAPs</a
				>. Check the
				<a
					href="https://github.com/webtresclub/huffplug/blob/main/merkletree-builder/whitelist.txt"
					target="_blank"
					class="underline text-secondary hover:text-secondary-focus"
				>
					whitelist.txt</a
				> to see if you're eligible.
			</p>

			<div class="flex flex-col sm:flex-row justify-center gap-4 mt-6">
				{#if !$account}
					<p class="text-base text-base-content/60">Please connect your wallet first.</p>
					<button on:click={() => $modal.open()} class="btn btn-primary btn-wide">
						Connect Wallet
					</button>
				{:else}
					<button on:click={claim} disabled={!canClaim} class="btn btn-success btn-wide">
						{canClaim ? 'Claim your Buttpluggy' : 'Already claimed or not eligible'}
					</button>
					<a href="/mine" class="btn btn-outline btn-wide">Mine instead</a>
				{/if}
			</div>
		</div>
	</div>
</main>
