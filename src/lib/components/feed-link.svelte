<script lang="ts">
	import type { FeedItem } from '$lib/server/db/sqlite-schema';
	import ReadLater from './read-later.svelte';

	let {
		item,
		showFeedName = true,
		showPublishDate = false,
		inReadLater
	}: {
		item: FeedItem & { feedName: string };
		showFeedName?: boolean;
		showPublishDate?: boolean;
		inReadLater?: boolean;
	} = $props();
</script>

<article class="py-2">
	<a href={item.url} target="_blank" class="block w-fit">
		<h2 class="w-fit text-lg">
			{item.title}
		</h2>
	</a>
	<div class="flex items-center gap-4 text-sm">
		{#if showFeedName}
			<a href={`/feeds/view/${item.feedId}`} class="hover:underline">
				{item.feedName}
			</a>
		{/if}

		{#if showPublishDate}
			<p>{item.publishedAt.toLocaleDateString()}</p>
		{/if}
	</div>

	<div class="mt-2 flex items-center gap-4 text-sm">
		<ReadLater itemId={item.id} isMarked={inReadLater} />
	</div>
</article>
