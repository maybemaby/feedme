<script lang="ts">
	import FeedItemCard from './feed-item-card.svelte';
	import FeedLink from './feed-link.svelte';

	export type FeedItem = {
		feedSlug: string;
		feedName: string;
		id: number;
		feedId: string;
		title: string;
		url: string;
		content: string;
		publishedAt: Date;
		createdAt: Date;
	};

	let {
		feedItems,
		viewMode = 'list'
	}: {
		feedItems: FeedItem[];
		viewMode?: 'list' | 'grid';
	} = $props();

	// State for view mode

	const groupedItems = $derived.by(() => {
		const groups: { [key: string]: typeof feedItems } = {};
		feedItems.forEach((item) => {
			const dateKey = item.publishedAt.toLocaleDateString();
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(item);
		});
		return groups;
	});
</script>

{#if viewMode === 'list'}
	<div class="py-4">
		{#each Object.entries(groupedItems) as [date, items] (date)}
			<div class="mb-8 border-b">
				<p class="font-mono text-xl">{date}</p>
				{#each items as item (item.id)}
					<FeedLink {item} />
				{/each}
			</div>
		{/each}
	</div>
{:else}
	<!-- Grid View -->
	<div class="py-4">
		{#each Object.entries(groupedItems) as [date, items] (date)}
			<div class="mb-8 border-b">
				<p class="mb-1 font-mono text-xl">{date}</p>
				<div class="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each items as item (item.id)}
						<FeedItemCard {item} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
