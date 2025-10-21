<script lang="ts">
	import * as Search from '$lib/components/search/index.js';
	import { searchAllResource } from '$lib/hooks/feed.svelte';

	let searchFocused = $state(false);
	let searchState = $state('');

	// Already debounced in the resource 300ms
	let searchResource = searchAllResource(() => searchState);

	let popoverOpen = $derived(
		searchFocused &&
			searchResource.current &&
			(searchResource.current.feedItems.length > 0 || searchResource.current.feeds.length > 0)
	);
</script>

<Search.Root bind:popoverOpen formAction="/search">
	<Search.Bar
		name="query"
		bind:value={searchState}
		onfocus={() => (searchFocused = true)}
		onblur={() => (searchFocused = false)}
	/>
	<Search.Popover>
		<p>Feeds</p>
		<hr class="mb-2" />
		<ul>
			{#each searchResource.current?.feeds as feed (feed.id)}
				<li class="hover:bg-accent/60 cursor-pointer p-2">{feed.name}</li>
			{:else}
				<li class="p-2 text-muted-foreground">No feeds found</li>
			{/each}
		</ul>
		<p>Feed Items</p>
		<hr class="mb-2" />
		<ul>
			{#each searchResource.current?.feedItems as result (result.id)}
				<li class="hover:bg-accent/60 cursor-pointer p-2">
					<a href={result.url} target="_blank">{result.title}</a>
				</li>
			{:else}
				<li class="p-2 text-muted-foreground">No feed items found</li>
			{/each}
		</ul>
	</Search.Popover>
</Search.Root>
