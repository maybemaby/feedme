<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { refreshFeedResource } from '$lib/hooks/feed.svelte.js';

	const { data } = $props();

	const refresh = refreshFeedResource();

	const groupedItems = $derived.by(() => {
		const groups: { [key: string]: typeof data.feedItems } = {};
		data.feedItems.forEach((item) => {
			const dateKey = item.publishedAt.toLocaleDateString();
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(item);
		});
		return groups;
	});
</script>

<div class="flex min-h-[300px] flex-col">
	<Button class="rounded-none" onclick={() => refresh.refetch()}>Refresh Feeds</Button>
	<div class="py-4">
		{#each Object.entries(groupedItems) as [date, items] (date)}
			<div class="mb-8 border-b">
				<p class="font-mono text-xl">{date}</p>
				{#each items as item (item.id)}
					<article class="py-2">
						<a href={item.url} target="_blank" class="mb-1 block w-fit">
							<h2 class="w-fit text-xl">
								{item.title}
							</h2>
						</a>
						<div class="flex items-center gap-4 text-sm">
							<!-- <p>{item.publishedAt.toLocaleDateString()}</p> -->
							<p>{item.feedName}</p>
						</div>
					</article>
				{/each}
			</div>
		{/each}
	</div>
</div>
