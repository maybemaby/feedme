<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from './ui/input/index.js';
	import { addFolder } from '$lib/folders.remote.js';

	let { onBlur, parentId }: { onBlur: () => void; parentId?: number } = $props();

	let inputRef = $state<HTMLInputElement | null>(null);

	onMount(() => {
		inputRef?.focus();
	});
</script>

<form
	{...addFolder.enhance(async ({ submit }) => {
		await submit();
		onBlur();
	})}
>
	<input type="hidden" name="parentId" value={parentId} />
	<Input
		onblur={onBlur}
		placeholder="Folder Name"
		bind:ref={inputRef}
		class="rounded-sm"
		autocomplete="off"
		{...addFolder.fields.folderName.as('text')}
	/>
</form>
