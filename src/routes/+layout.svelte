<script>
import '../app.postcss';
import "@picocss/pico";


import { configureChains, createConfig } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'

import { goerli, mainnet } from '@wagmi/core/chains'

import {onMount} from 'svelte';

onMount(async () => {
    const { chains, publicClient, webSocketPublicClient } = configureChains(
        [goerli],
        [publicProvider()],
    );

    const config = await createConfig({
        //chains,
        publicClient,
        webSocketPublicClient,
    });
});
</script>

<slot />
