<script>
import '../app.postcss';
import "@picocss/pico";
import {getConfigWagmi} from '$lib/contracts';
import {onMount} from 'svelte';

onMount(async () => {
    // this will init wagmi
    await getConfigWagmi();
});
</script>

<slot />
