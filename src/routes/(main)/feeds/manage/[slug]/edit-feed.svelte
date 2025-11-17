<script lang="ts">
	import { editFeed } from './actions.remote';
	import FormGroup from '$lib/components/form-group.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import FolderSelect from '$lib/components/folder-select.svelte';
	import { Button } from '$lib/components/ui/button';

	const { url, folderId } = editFeed.fields;

	let {
		feedSlug,
		initialData
	}: { feedSlug: string; initialData: { url: string; folderId: number | null } } = $props();

	$effect.pre(() => {
		url.set(initialData.url);
		if (initialData.folderId) {
			folderId.set(initialData.folderId.toString());
		}
	});
</script>

<form {...editFeed} class="flex flex-col gap-2">
	<input type="hidden" name="slug" value={feedSlug} />
	<FormGroup errors={url.issues()} field="url">
		<Label for="url">Feed URL</Label>
		<Input {...url.as('url')} />
	</FormGroup>
	<FormGroup field="folderId" errors={folderId.issues()}>
		<Label for="folderId">Folder</Label>
		<FolderSelect
			name="folderId"
			id="folderId"
			initialValue={initialData.folderId ? initialData.folderId.toString() : null}
		/>
	</FormGroup>
	<Button type="submit" class="mt-4 rounded-none active:scale-95" size="lg">Save</Button>
	{#if editFeed.result?.success && !editFeed.pending}
		<p class="text-success">Feed updated successfully!</p>
	{/if}
</form>
