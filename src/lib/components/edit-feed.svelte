<script lang="ts">
	import { enhance } from '$app/forms';
	import FormGroup from './form-group.svelte';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import { page } from '$app/state';
	import type { ActionData } from '../../routes/(main)/feeds/manage/[slug]/$types';
	import FolderSelect from './folder-select.svelte';
	import { Button } from './ui/button';

	let form = $derived(page.form as ActionData);

	let {
		feedSlug,
		initialData
	}: { feedSlug: string; initialData: { url: string; folderId: number | null } } = $props();
</script>

<form
	action={`/feeds/manage/${feedSlug}?/edit`}
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
	method="post"
	class="flex flex-col gap-2"
>
	<FormGroup errors={form?.fields} field="url">
		<Label for="url">Feed URL</Label>
		<Input type="url" name="url" id="url" value={initialData.url} />
	</FormGroup>
	<FormGroup field="folderId" errors={form?.fields}>
		<Label for="folderId">Folder</Label>
		<FolderSelect
			name="folderId"
			id="folderId"
			initialValue={initialData.folderId ? initialData.folderId.toString() : null}
		/>
	</FormGroup>
	<Button type="submit" class="mt-4 rounded-none active:scale-95" size="lg">Save</Button>
	{#if form?.success}
		<p class="text-success">Feed updated successfully!</p>
	{/if}
</form>
