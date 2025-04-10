<script lang="ts">
	export let data = {};

	let hovered = 0;
</script>

<div class=" backdrop-blur-md border-b border-slate-700">
	<div class="container mx-auto px-4 py-2">
		<div class="breadcrumbs text-sm">
			<ul>
				<li><a href="/">Home</a></li>
				<li class="text-white">Attributes</li>
			</ul>
		</div>
	</div>
</div>
<div class="container mx-auto px-4 py-2">
	<main class="">
		<h1 class="text-4xl font-bold mb-8">Attributes</h1>

		{#each Object.keys(data.attributes) as attr}
			<section class="mb-12">
				<h2 class="text-2xl font-semibold mb-4">{attr}</h2>

				<div class="overflow-x-auto">
					<table class="table table-zebra w-full text-sm">
						<thead>
							<tr>
								<th>Value</th>
								<th>Count</th>
								<th>Examples</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.keys(data.attributes[attr]) as value}
								<tr>
									<td class="font-medium">{value}</td>
									<td>{data.attributes[attr][value].length}</td>
									<td>
										<div class="flex flex-wrap gap-2">
											{#each data.attributes[attr][value].slice(0, 7) as i}
												<a
													href={`/buttpluggy/${i}`}
													on:mouseenter={() => (hovered = i)}
													on:mouseleave={() => (hovered = 0)}
													class="tooltip"
													data-tip={`#${i}`}
												>
													<img
														src={(hovered === i ? '/images/' : '/images_small/') +
															('00000' + i).slice(-4) +
															(hovered === i ? '.gif' : '.png')}
														alt={`Buttpluggy ${i}`}
														class="h-16 w-16 rounded-md border border-base-300"
													/>
												</a>
											{/each}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/each}
	</main>
</div>
