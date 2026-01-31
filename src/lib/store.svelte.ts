import { createAppKit } from '@reown/appkit';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKit } from '@reown/appkit';
import type { Config } from 'wagmi';

export const networks = [mainnet, sepolia];

class WalletState {
    modal = $state<AppKit | null>(null);
    config = $state<Config | null>(null);
    loadReady = $state(false);
    account = $state<`0x${string}` | null>(null);

    // Derived state
    chainId = $derived.by(() => {
        try {
            // Accessing state inside derived to ensure reactivity if modal changes
            const currentModal = this.modal;
            if (!currentModal) return 0n;
            const cid = currentModal.getChainId();
            return cid ? BigInt(cid) : 0n;
        } catch (e) {
            return 0n;
        }
    });

    initWeb3() {
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
            this.loadReady = true;

            const addressAccount = _modal.getAddress();
            if (addressAccount) {
                this.account = addressAccount as `0x${string}`;
            } else {
                this.account = null;
            }
        });

        _modal.subscribeState((newState) => console.log({ newState }));

        this.modal = _modal;
        this.config = wagmiAdapter.wagmiConfig;
    }
}

export const walletState = new WalletState();
