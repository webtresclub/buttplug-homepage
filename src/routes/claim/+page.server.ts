import proofs from '$lib/proofs.json';

const wallets: string[] = [];
for (const proof of proofs) {
	wallets.push(proof.wallet.toLowerCase());
}


export async function load() {
    return {
        wallets
    }
}
