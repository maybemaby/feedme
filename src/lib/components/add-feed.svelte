<script lang="ts">
	import FormGroup from '$lib/components/form-group.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import EditFeed from '../../routes/(main)/feeds/manage/[slug]/edit-feed.svelte';
	import { resolve } from '$app/paths';
	import { addFeed } from '$lib/feeds/feeds.remote';
	import { invalidateAll } from '$app/navigation';
</script>

<form
	{...addFeed.enhance(async ({ submit }) => {
		await submit();
		await invalidateAll();
	})}
	class="flex flex-col gap-2"
>
	{#if addFeed.result}
		<div>
			<p class="mb-4 text-lg">New Feed Added:</p>
			<a href={resolve(`/feeds/view/${addFeed.result.feed.slug}`)}>
				<p>{addFeed.result.feed.name}</p>
			</a>

			<div class="my-4">
				<EditFeed
					feedSlug={addFeed.result.feed.slug}
					initialData={{
						folderId: addFeed.result.feed.folderId,
						url: addFeed.result.feed.url
					}}
				/>
			</div>
		</div>
	{:else}
		<p>Add Feed</p>
		<FormGroup field="url" errors={addFeed.fields.url.issues()}>
			<Label for="url">Feed URL</Label>
			<Input
				id="url"
				placeholder="https://feed.com/rss.xml"
				{...addFeed.fields.url.as('url')}
				autocomplete="off"
			/>
		</FormGroup>
		<Button disabled={addFeed.pending > 0} type="submit">Add</Button>
	{/if}
</form>
