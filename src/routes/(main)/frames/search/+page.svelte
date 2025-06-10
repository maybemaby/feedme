<script lang="ts">
	import GenderSelect from '$lib/components/gender-select.svelte';
	import ShapeSelect from '$lib/components/shape-select.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();
</script>

<!-- Filters -->
<form method="get">
	<div class="mb-4 flex flex-wrap items-end gap-4">
		<ShapeSelect errors={{}} />
		<GenderSelect errors={{}} />
		<Button type="submit" variant="secondary">Apply Filter</Button>
	</div>
</form>

<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#await data.frames}
		Loading
	{:then frames}
		{#each frames as frame (frame.id)}
			<Card.Root class="gap-3 rounded-sm py-4">
				<Card.Header>
					<a href={`/frames/${frame.id}`}>
						<Card.Title>{frame.name}</Card.Title>
						<p class="text-sm">{frame.brandName}</p>
					</a>
				</Card.Header>
				<Card.Content>
					<div class="h-20 w-full bg-gray-200"></div>
				</Card.Content>
			</Card.Root>
		{/each}
	{/await}
</div>
