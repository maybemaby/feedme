<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	let { data } = $props();

	let description = $derived.by(() => {
		const descriptors = [data.frame.color, data.frame.shape, data.frame.gender];
		return descriptors.filter(Boolean).join(', ');
	});
</script>

<section id="original-frame" class="mt-6 mb-12 grid gap-4 sm:grid-cols-2">
	<div class="bg-background flex min-h-[300px] items-center justify-center">
		<img
			src={'https://pub-d8cfb5171fe14b0897199ea6f33587b7.r2.dev/' + data.frame.images[0]}
			alt="Glasses Preview"
			class="object-cover"
		/>
	</div>
	<div>
		<h1 class="text-2xl font-semibold">{data.frame.name}</h1>
		<p class="text-lg">{data.frame.brandName}</p>
		<p>{description}</p>

		<div class="mt-10">
			<p class="text-xl">$400</p>
			<a
				href={data.frame.link}
				target="_blank"
				rel="noopener noreferrer"
				class="hover:border-primary flex w-fit items-center border-b-2 border-dashed"
			>
				View Original Frame
				<ArrowUpRight class="inline size-6" />
			</a>
		</div>
	</div>
</section>

<section id="alternatives">
	<div class="mb-4 flex items-center gap-6">
		<h2 class="text-2xl">Suggested Alternatives</h2>
		<Button href={`/frames/alternative?forId=${data.frame.id}`}>Add Alternative</Button>
	</div>
	{#await data.alternatives}
		<p>Loading</p>
	{:then alternatives}
		{#if alternatives.length === 0}
			<p>No alternatives yet.</p>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				{#each alternatives as alt (alt.id)}
					<div class="bg-background relative flex min-h-[230px] items-center justify-center">
						<img
							src={'https://pub-d8cfb5171fe14b0897199ea6f33587b7.r2.dev/' + alt.images[0]}
							alt={alt.name}
							class="object-contain"
						/>
					</div>
					<div>
						<div class="mb-3 flex flex-col gap-1.5">
							<p class="text-xl">{alt.name}</p>
							<p>{alt.brandName}</p>
							<p>$100</p>
						</div>

						<Button href={alt.link} target="_blank" rel="noopener noreferrer" variant="link">
							View Alternative
							<ArrowUpRight class="inline size-6" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
</section>
