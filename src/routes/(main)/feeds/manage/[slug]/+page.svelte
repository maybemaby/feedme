<script lang="ts">
	import { resolve } from '$app/paths';
	import EditFeed from './edit-feed.svelte';
	import { Button } from '$lib/components/ui/button';
	import { deleteFeed, loadFeed } from './actions.remote';
	import { page } from '$app/state';

	let slug = page.params.slug;
	let prev = page.url.searchParams.get('prev');
	const res = await loadFeed(slug!);
</script>

<div>
	{#if prev}
		<a href={prev} class="text-sm">← Back</a>
	{:else}
		<a href={resolve('/feeds/manage')} class="text-sm">← Back to Manage Feeds</a>
	{/if}

	<h1 class="mt-4 text-2xl">{res.feed.name}</h1>
	<p class="mb-8 text-sm font-light">
		Last Refreshed: {res.feed.refreshedAt?.toLocaleString()}
	</p>

	<h2 class="mb-4 text-lg">Update Feed Properties</h2>
	<EditFeed feedSlug={res.feed.slug} initialData={res.feed} />
	<hr class="my-8" />
	<h2 class="mb-4 text-lg">Danger Zone</h2>
	<p class="text-destructive">
		Warning: Deleting the feed will remove all feed items, including the favorited ones.
	</p>
	<form {...deleteFeed}>
		<input type="hidden" name="slug" value={res.feed.slug} />
		<Button
			type="submit"
			variant="destructive"
			class="rounded-none active:scale-95"
			size="lg"
			disabled={deleteFeed.pending > 0}>Delete Feed</Button
		>
	</form>
</div>
