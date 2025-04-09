<script lang="ts">
	export let data = {};

	import Breadcrumbs from '$lib/Breadcrumbs.svelte';

	let hovered = 0;
</script>

<Breadcrumbs>
	<ul>
		<li><a href="/">Home</a></li>
		<li>Attributes</li>
	</ul>
</Breadcrumbs>

<main class="container py-4">
	<div>
		<h1 class="text-4xl">Attributes</h1>
		{#each Object.keys(data.attributes) as attr}
			<h2 class="text-2xl">{attr}</h2>

			<table>
				<thead>
					<tr>
						<th scope="col">Value</th>
						<th scope="col">#</th>
						<th scope="col">Examples</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.keys(data.attributes[attr]) as value}
						<tr>
							<td>{value}</td>
							<td>{data.attributes[attr][value].length}</td>
							<td>
								<div class="flex">
									{#each data.attributes[attr][value].slice(0, 7) as i}
										<a
											href="/buttpluggy/{i}"
											on:mouseenter={() => {
												hovered = i;
											}}
											on:mouseleave={() => {
												hovered = 0;
											}}
										>
											<img
												src="{hovered == i ? '/images/' : '/images_small/'}{('00000' + i).slice(
													-4
												) + (hovered == i ? '.gif' : '.png')}"
												alt="Buttpluggy {i}"
												class="p-1 block h-16 w-16"
											/>
										</a>
									{/each}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/each}
	</div>
</main>
