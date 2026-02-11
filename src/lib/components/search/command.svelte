<script lang="ts">
	import * as Command from '$lib/components/ui/command/index';
	import { Debounced, PressedKeys } from 'runed';
	import Button from '../ui/button/button.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import { searchAllResources } from '$lib/feeds/feeds.remote';

	let open = $state(false);
	let searchQuery = $state('');
	let debouncedQuery = new Debounced(() => searchQuery, 200);

	let searchResults = $derived(searchAllResources(debouncedQuery.current));

	const keys = new PressedKeys();

	keys.onKeys(['meta', 'k'], () => {
		open = true;
	});
</script>

<Button variant="outline" onclick={() => (open = true)} size="sm" class="text-foreground/60">
	<SearchIcon />
	Search
	<kbd class="ml-2 flex items-center gap-0.5 font-mono">
		<span class="text-lg"> ⌘ </span>
		<span> K </span>
	</kbd>
</Button>

<Command.Dialog bind:open shouldFilter={false}>
	<Command.Input placeholder="Search..." bind:value={searchQuery} class="text-[16px]" />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#if searchResults.loading}
			<Command.Loading />
		{/if}

		{#if searchResults.current}
			<Command.Group heading="Feeds">
				{#each searchResults.current.feeds as feed (feed.id)}
					<Command.LinkItem href={resolve(`/feeds/view/${feed.id}`)}>
						{feed.name}
					</Command.LinkItem>
				{/each}
			</Command.Group>
			<Command.Separator />
			<Command.Group heading="Items">
				{#each searchResults.current.feedItems as item (item.id)}
					<Command.LinkItem href={item.url} target="_blank">
						<ArrowUpRight class="text-muted-foreground mr-1 inline-block size-4" />
						{item.title}
					</Command.LinkItem>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
