<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { ArrowUpRight } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<form>
	<Input name="query" placeholder="Feed title or Article title" />
</form>

<div class="relative">
	<h1 class="my-8 text-2xl font-bold">Search Results</h1>

	<h2 class="mb-4 text-lg">Feeds</h2>
	<ul>
		{#each data.feeds as feed (feed.id)}
			<li class="hover:bg-accent/60 cursor-pointer p-2">
				<a href={`/feeds/view/${feed.slug}`}>
					{feed.name}
				</a>
			</li>
		{:else}
			<li class="p-2 text-muted-foreground">No feeds found</li>
		{/each}
	</ul>

	<h2 class="mt-8 mb-4 text-lg">Feed Items</h2>
	<ul class="flex flex-col gap-2">
		{#each data.feedItems as item (item.id)}
			<li class="hover:bg-accent/60 flex w-fit items-center gap-2 p-2">
				<a href={item.url} target="_blank">{item.title} </a>
				<ArrowUpRight class="text-muted-foreground" />
			</li>
		{:else}
			<li class="p-2 text-muted-foreground">No feed items found</li>
		{/each}
	</ul>
</div>
