<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let currentNumber = 0;

	let animation = tweened(Number(0), { duration: 300, easing: cubicOut });

	$: if (typeof currentNumber !== 'undefined') {
		animation.set(Number(currentNumber));
	}
</script>

{$animation.toFixed(0)}
