import proofs from '$lib/proofs.json';

const wallets = {};
for (const proof of proofs) {
	wallets[proof.wallet] = proof.proof;
}


export async function load() {
    return {
        wallets
    }
}
