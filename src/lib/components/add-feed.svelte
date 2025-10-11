<script lang="ts">
	import { invalidate } from '$app/navigation';
	import FormGroup from '$lib/components/form-group.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { addFeedResource } from '$lib/hooks/feed.svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import EditFeed from './edit-feed.svelte';

	let url = $state('');

	let feedResource = addFeedResource(() => url);

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		await feedResource.refetch();
		await invalidate('/');
	};
</script>

<form action="/feeds?/add" class="flex flex-col gap-2" onsubmit={handleSubmit}>
	{#if feedResource.current}
		<div>
			<p class="mb-4 text-lg">New Feed Added:</p>
			<a href={`/feeds/view/${feedResource.current.feed.slug}`}>
				<p>{feedResource.current.feed.name}</p>
			</a>

			<div class="my-4">
				<EditFeed
					feedSlug={feedResource.current.feed.slug}
					initialData={{
						folderId: feedResource.current.feed.folderId,
						url: feedResource.current.feed.url
					}}
				/>
			</div>
		</div>
	{:else}
		<p>Add Feed</p>
		<FormGroup field="url">
			<Label for="url">Feed URL</Label>
			<Input
				type="url"
				name="url"
				id="url"
				placeholder="https://feed.com/rss.xml"
				bind:value={url}
			/>
		</FormGroup>
		{#if feedResource.error}
			<p class="text-red-500">{feedResource.error.message}</p>
		{/if}
		<Button disabled={feedResource.loading} type="submit">Add</Button>
	{/if}
</form>
