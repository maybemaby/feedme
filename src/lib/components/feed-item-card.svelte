<script lang="ts">
	import { resolve } from '$app/paths';
	import { type FeedItem } from './feed-view.svelte';
	import ReadLater from './read-later.svelte';

	let { item }: { item: FeedItem } = $props();
</script>

<div class="hover:border-foreground border p-4">
	<article>
		<a href={item.url} target="_blank" class="block">
			<h2 class="mb-1 line-clamp-2 text-lg font-medium" title={item.title}>
				{item.title}
			</h2>
		</a>
		<div class="text-foreground/70 flex flex-col gap-2 text-sm hover:underline">
			<a href={resolve(`/feeds/view/${item.feedId}`)}>
				{item.feedName}
			</a>
		</div>
		<div class="mt-2 flex items-center gap-4 text-sm">
			<ReadLater itemId={item.id} />
		</div>
	</article>
</div>
