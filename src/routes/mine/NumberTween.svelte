<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let { currentNumber = 0 } = $props();

	let animation = tweened(Number(0), { duration: 300, easing: cubicOut });

	$effect(() => {
		if (typeof currentNumber !== 'undefined') {
			animation.set(Number(currentNumber));
		}
	});
</script>

{$animation.toFixed(0)}
