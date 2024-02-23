import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'


import { mainnet, sepolia } from "viem/chains";

import { reconnect } from '@wagmi/core'
import { watchAccount, watchChainId, getAccount } from '@wagmi/core'

import { writable } from "svelte/store";

// const projectId = import.meta.env.VITE_WEB3MODAL_PROJECT_ID;
const projectId = "619498c450ee42530036acb486570472";


// export const provider = writable();

export const modal = writable();
export const config = writable();
export const loadReady = writable(false);

export const chainId = writable();
export const account = writable();

export function initWeb3() {
  // 2. Create wagmiConfig
  const metadata = {
    name: 'Buttplugy',
    description: 'Buttplugy',
    url: 'https://buttplug-homepage.vercel.app/', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }

  const _config = defaultWagmiConfig({
    chains: [mainnet, sepolia], // required
    projectId, // required
    metadata, // required
    // transports: ['http', 'ws'], // Optional - defaults to ['http', 'ws']
    // ...wagmiOptions // Optional - Override createConfig parameters
  })
  window.c = _config
  
  // 3. Create modal
  const _modal = createWeb3Modal({
    wagmiConfig: _config,
    projectId,
    enableAnalytics: true // Optional - defaults to your Cloud configuration
  });

  _modal.subscribeState(stateData => {
    // lets set the ready after we have the selected network
    loadReady.set(true);
    
    chainId.set(stateData.selectedNetworkId);
    const dataAccount  = getAccount(_config);
    if (dataAccount && dataAccount.address) {
      account.set(dataAccount.address);
    }
  });

  reconnect(_config);
  
  modal.set(_modal);
  config.set(_config);
  chainId.set(
    _modal.getState().selectedNetworkId
  );

}

