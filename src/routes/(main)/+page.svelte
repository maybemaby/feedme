<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { refreshFeedResource } from '$lib/hooks/feed.svelte.js';
	import { goto } from '$app/navigation';
	import FeedLink from '$lib/components/feed-link.svelte';

	const { data } = $props();

	const navigatePage = (page: number) => {
		goto(`/?p=${page}`);
	};

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

<div class="flex flex-col">
	<!-- <Button class="rounded-none" onclick={() => refresh.refetch()}>Refresh Feeds</Button> -->

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
	<Pagination.Root count={data.feedCount} perPage={20} page={data.page} onPageChange={navigatePage}>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>
