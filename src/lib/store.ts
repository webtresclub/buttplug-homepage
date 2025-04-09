// main.ts
import { createAppKit } from '@reown/appkit';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKit } from '@reown/appkit';
import type { Config } from 'wagmi';

export const networks = [mainnet, sepolia];

import { writable, derived } from 'svelte/store';

export const modal = writable<AppKit | null>(null);
export const config = writable<Config | null>(null);
export const loadReady = writable<boolean>(false);
export const account = writable<`0x${string}` | null>(null);

export function initWeb3() {
	// 1. Get a project ID at https://cloud.reown.com
	const projectId = '0779e27e27e83fb209a5a5633f70197a';

	// 2. Set up Wagmi adapter
	const wagmiAdapter = new WagmiAdapter({
		projectId,
		networks
	});

	// 3. Configure the metadata
	const metadata = {
		name: 'Buttplugy',
		description: 'AppKit Example',
		url: 'https://reown.com/appkit', // origin must match your domain & subdomain
		icons: ['https://assets.reown.com/reown-profile-pic.png']
	};

	// 3. Create the modal
	const _modal = createAppKit({
		adapters: [wagmiAdapter],
		networks: [mainnet, sepolia],
		metadata,
		projectId,
		features: {
			analytics: true // Optional - defaults to your Cloud configuration
		}
	});

	_modal.subscribeWalletInfo((stateData) => {
		// lets set the ready after we have the selected network
		loadReady.set(true);

		const addressAccount = _modal.getAddress();
		if (addressAccount) account.set(addressAccount as `0x${string}`);
	});

	_modal.subscribeState((newState) => console.log({newState}));


	modal.set(_modal);
	config.set(wagmiAdapter.wagmiConfig);
}

export const chainId = derived(modal, ($modal) => {
	try {
		const chainId = $modal.getChainId();
		return chainId ? BigInt(chainId) : 0n;
	} catch (e) {
		return 0n;
	}
});
