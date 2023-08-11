import { connect } from '@wagmi/core'
import { watchNetwork } from '@wagmi/core'
import { goerli } from '@wagmi/core/chains'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'

import { writable } from "svelte/store";

export const account = writable();
export const provider = writable();
export const chain = writable();

export async function connectMetamask() {
    const result = await connect({
        chainId: goerli.id,
        connector: new MetaMaskConnector({
            chains: [goerli],
        })
    });
    account.set(result.account);
    chain.set(result.chain.id);
    provider.set(result.provider);

    const unwatch = watchNetwork((network) => {
        try {
            chain.set(network.chain.id);
        } catch (e) {
            // lost connection ??
            document.location.reload();
        }
    });
}