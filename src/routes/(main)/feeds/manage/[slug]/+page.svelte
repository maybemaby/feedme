<script lang="ts">
	import EditFeed from '$lib/components/edit-feed.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div>
	<a href="/feeds/manage" class="text-sm">← Back to Manage Feeds</a>
	<h1 class="mt-4 text-2xl">{data.feed.name}</h1>
	<p class="mb-8 text-sm font-light">
		Last Refreshed: {data.feed.refreshedAt?.toLocaleString()}
	</p>

	<h2 class="mb-4 text-lg">Update Feed Properties</h2>
	<EditFeed feedSlug={data.feed.slug} initialData={data.feed} />
	<hr class="my-8" />
	<h2 class="mb-4 text-lg">Danger Zone</h2>
	<p class="text-destructive">
		Warning: Deleting the feed will remove all feed items, including the favorited ones.
	</p>
	<form method="post" action="?/delete">
		<Button type="submit" variant="destructive" class="rounded-none active:scale-95" size="lg"
			>Delete Feed</Button
		>
	</form>
</div>
