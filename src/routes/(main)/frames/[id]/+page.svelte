<script lang="ts">
	import { PUBLIC_S3_URL } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	let { data } = $props();

	let description = $derived.by(() => {
		const descriptors = [data.frame.color, data.frame.shape, data.frame.gender];
		return descriptors.filter(Boolean).join(', ');
	});
</script>

<section id="original-frame" class="mt-6 mb-12 grid gap-4 sm:grid-cols-2">
	<div class="bg-background flex min-h-[300px] items-center justify-center">
		<img src={PUBLIC_S3_URL + data.frame.images[0]} alt="Glasses Preview" class="object-cover" />
	</div>
	<div>
		<h1 class="text-2xl font-semibold">{data.frame.name}</h1>
		<p class="text-lg">{data.frame.brandName}</p>
		<p>{description}</p>

		<div class="mt-10">
			<p class="text-xl">${data.frame.price}</p>
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

<Separator class="mb-4" />

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
			<div class="grid gap-y-8 sm:grid-cols-2">
				{#each alternatives as alt (alt.id)}
					<div class="bg-background relative flex min-h-[230px] items-center justify-center">
						<img
							src={PUBLIC_S3_URL + alt.images[0]}
							alt={alt.name}
							class="object-contain"
							height={260}
							width={600}
						/>
					</div>
					<div>
						<div class="mb-3 flex flex-col gap-1.5">
							<p class="text-xl">{alt.name}</p>
							<p>{alt.brandName}</p>
							<p>${alt.price}</p>
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
