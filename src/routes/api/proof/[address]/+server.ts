import { json } from '@sveltejs/kit';
import { isAddress } from 'viem';
import proofs from '$lib/proofs.json';

// @dev this will be necesary only if merkle tree is too big

const proofsParsed: { [key: string]: unknown } = {};
for (const proof of proofs) {
	proofsParsed[proof.wallet.toLowerCase()] = proof.proof;
}

export function GET({ params }) {
	if (!isAddress(params.address)) {
		return new Response('Invalid address', { status: 400 });
	}

	return json({
		wallet: params.address,
		proof: proofsParsed[params.address.toLowerCase()] || []
	});
}
