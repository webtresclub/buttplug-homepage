<script lang="ts">
import { connectMetamask, account, chain} from '$lib/user.store';

export let data;

let canClaim = false;
let proof = [];
$: if ($account) {
    proof = data.proofsParsed[$account.toLowerCase()] || [];
    
}
</script>

