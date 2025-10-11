<script lang="ts">
	import { enhance } from '$app/forms';
	import EditFeed from '$lib/components/edit-feed.svelte';
	import FolderSelect from '$lib/components/folder-select.svelte';
	import FormGroup from '$lib/components/form-group.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let url = $state(data.feed.url);
</script>

<div>
	<a href="/feeds/manage" class="text-sm">← Back to Manage Feeds</a>
	<h1 class="mt-4 mb-8 text-2xl">{data.feed.name}</h1>

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
