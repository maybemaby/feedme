<script lang="ts">
	import FeedLink from '$lib/components/feed-link.svelte';
	import { getReadLaterItems } from '$lib/feeds/feed-items.remote';
</script>

<div>
	<h1 class="text-xl font-bold">Read Later</h1>
</div>
<div class="my-4">
	{#each await getReadLaterItems() as item (item.id)}
		<FeedLink {item} showFeedName={true} showPublishDate={true} />
	{/each}
</div>
