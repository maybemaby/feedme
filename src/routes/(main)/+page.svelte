<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { refreshFeedResource } from '$lib/hooks/feed.svelte.js';

	const { data } = $props();

	const refresh = refreshFeedResource();
</script>

<div class="flex min-h-[300px] flex-col">
	<Button onclick={() => refresh.refetch()}>Refresh Feeds</Button>
	<ul>
		{#each data.feedItems as item}
			<li class="p-2">
				<a href={item.url} target="_blank" class="mb-1 block w-fit">
					<h2 class="w-fit text-xl">
						{item.title}
					</h2>
				</a>
				<div class="flex items-center gap-4 text-sm">
					<p>{item.publishedAt.toLocaleDateString()}</p>
					<p>{item.feedName}</p>
				</div>
			</li>
		{/each}
	</ul>
</div>
