<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_S3_URL } from '$env/static/public';
	import GenderSelect from '$lib/components/gender-select.svelte';
	import ShapeSelect from '$lib/components/shape-select.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();

	let searchParams = $derived(page.url.searchParams);

	function searchParamsWithPage(direction: 'next' | 'prev') {
		const currentPage = searchParams.get('page') || '1';
		const pageNumber = parseInt(currentPage, 10);

		const newPage = direction === 'next' ? pageNumber + 1 : Math.max(pageNumber - 1, 1);

		const params = new URLSearchParams(searchParams);
		params.set('page', newPage.toString());

		return params.toString();
	}
</script>

<!-- Filters -->
<form method="get">
	<div class="mb-4 flex flex-wrap items-end gap-4">
		<ShapeSelect errors={{}} />
		<GenderSelect errors={{}} />
		<Button type="submit" variant="secondary">Apply Filter</Button>
	</div>
</form>

<form class="mb-4" method="get">
	<Button type="submit" variant="outline">Reset Filters</Button>
</form>

<div class="mb-4">
	Can't find the frames you're looking for?

	<a href="/frames/new" class="text-blue-500 hover:underline"> Request a new frame </a>
</div>

{#await data.frames}
	Loading
{:then frames}
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each frames as frame (frame.id)}
			<Card.Root class="gap-3 rounded-sm py-4">
				<Card.Header>
					<a href={`/frames/${frame.id}`}>
						<Card.Title>{frame.name}</Card.Title>
						<p class="text-sm">{frame.brandName}</p>
					</a>
				</Card.Header>
				<Card.Content>
					<div class="bg-card h-30 w-full">
						{#if frame.images && frame.images.length > 0}
							<img
								src={PUBLIC_S3_URL + frame.images[0]}
								alt={frame.name}
								class="h-full w-full object-contain md:object-cover"
							/>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="flex items-center justify-between">
		{#if data.prevPage}
			<Button href={`/frames/search?${searchParamsWithPage('prev')}`}>Previous Page</Button>
		{/if}

		{#if frames.length >= 20}
			<Button href={`/frames/search?${searchParamsWithPage('next')}`}>Next Page</Button>
		{/if}
	</div>
{/await}
