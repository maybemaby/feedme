<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Settings from '@lucide/svelte/icons/settings';
	import FeedLink from '$lib/components/feed-link.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Pagination from '$lib/components/ui/pagination';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const navigatePage = (page: number) => {
		goto(resolve(`/feeds/view/${data.feedId}?p=${page}`));
	};

	const feedName = $derived(data.feedItems[0]?.feedName);
	const feedSlug = $derived(data.feedItems[0]?.feedSlug);
	const feedUrl = $derived(data.feedItems[0]?.feedUrl);
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

<div class="flex items-start justify-between gap-4">
	<div>
		<h1 class="mb-1 text-xl font-bold">{feedName}</h1>
		<a href={feedUrl} target="_blank" class="underline">
			{feedUrl}
		</a>
	</div>
	<Button
		size="icon"
		variant="outline"
		href={resolve(
			`/feeds/manage/${feedSlug}?prev=${encodeURIComponent(`/feeds/view/${data.feedId}`)}`
		)}
	>
		<Settings />
	</Button>
</div>

<div class="py-4">
	{#each data.feedItems as item (item.id)}
		<FeedLink {item} showFeedName={false} showPublishDate />
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
