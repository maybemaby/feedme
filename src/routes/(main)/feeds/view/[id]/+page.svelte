<script lang="ts">
	import { goto } from '$app/navigation';
	import FeedLink from '$lib/components/feed-link.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const navigatePage = (page: number) => {
		goto(`/feeds/view/${data.feedId}?p=${page}`);
	};

	const feedName = $derived(data.feedItems[0]?.feedName);
</script>

{#snippet paginator(count: number)}
	<Pagination.Root {count} perPage={20} page={data.page} onPageChange={navigatePage}>
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
{/snippet}

<h1 class="text-xl font-bold">{feedName}</h1>

<div class="py-4">
	{#each data.feedItems as item (item.id)}
		<FeedLink {item} />
	{:else}
		<p>No items found for this feed.</p>
	{/each}
</div>
<div class="flex flex-col">
	{#await data.itemCount}
		{@render paginator(0)}
	{:then count}
		{@render paginator(count)}
	{/await}
</div>
