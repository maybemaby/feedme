<script lang="ts">
	import { page } from '$app/state';
	import Search from '$lib/components/search.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { debounced } from '$lib/hooks/debounced.svelte.js';

	let { data } = $props();

	let searchVal = $state('');

	$effect(() => {
		debounced(() => {
			console.log('Search value changed:', searchVal);
		}, 500);
	});
</script>

<div class="mb-6 flex items-end justify-center gap-6">
	<div class="w-[400px] max-w-full">
		<p>Search for an existing frame</p>
		<form method="get">
			<input type="hidden" id="forId" name="forId" value={data.frame.id} />
			<Search
				name="q"
				bind:value={searchVal}
				placeholder="Search by brand or name"
				formWrap={false}
			/>
		</form>
	</div>

	<div class="my-2">
		<p class="text-lg">or</p>
	</div>

	<Button href={`/frames/new?alternateFor=${data.frame.id}`}>Add new frame to database</Button>
</div>

{#if data.searchedFrames}
	{#await data.searchedFrames}
		Loading
	{:then frames}
		<div class="mx-auto max-w-[800px] border p-4">
			<h1 class="mb-2 text-2xl font-semibold">Results</h1>
			<Separator class="mb-2" />
			{#each frames as frame (frame.id)}
				<!-- Exclude the frame you are selecting for -->
				{#if frame.id !== data.frame.id}
					<div
						class="hover:bg-muted/50 focus-within:bg-muted/50 flex justify-between gap-4 pb-6 focus-within:border-y hover:border-y"
					>
						<div>
							<h2 class="text-lg">{frame.name}</h2>
							<p>{frame.brandName}</p>
						</div>

						<form method="post">
							<input type="hidden" name="forId" value={data.frame.id} />
							<input type="hidden" name="frameId" value={frame.id} />
							<Button type="submit">Select as alternate</Button>
						</form>
					</div>
				{/if}
			{/each}
		</div>
	{/await}
{/if}
