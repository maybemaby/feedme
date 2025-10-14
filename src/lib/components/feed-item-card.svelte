<script lang="ts">
	import { type FeedItem } from './feed-view.svelte';

	let { item }: { item: FeedItem } = $props();
</script>

<div class="hover:border-foreground border p-4">
	<article>
		<a href={item.url} target="_blank" class="block">
			<h2 class="mb-2 line-clamp-2 text-lg font-medium">
				{item.title}
			</h2>
		</a>
		<div class="text-foreground/70 flex flex-col gap-2 text-sm hover:underline">
			<a href={`/feeds/view/${item.feedId}`}>
				{item.feedName}
			</a>
		</div>
	</article>
</div>
