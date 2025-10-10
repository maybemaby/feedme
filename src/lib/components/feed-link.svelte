<script lang="ts">
	import type { FeedItem } from '$lib/server/db/sqlite-schema';

	let { item }: { item: FeedItem } = $props();
</script>

<article class="py-2">
	<a href={item.url} target="_blank" class="block w-fit">
		<h2 class="w-fit text-xl">
			{item.title}
		</h2>
	</a>
	<div class="flex items-center gap-4 text-sm">
		<p>{item.feedName}</p>
	</div>
</article>
