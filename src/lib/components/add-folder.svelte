<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from './ui/input/index.js';
	import { addFolderResource } from '$lib/hooks/folders.svelte.js';

	let { onBlur, parentId }: { onBlur: () => void; parentId?: number } = $props();

	let inputRef = $state<HTMLInputElement | null>(null);
	let value = $state('');

	let submitData = $derived({
		name: value,
		parentId: parentId ?? null
	});

	const addFolder = addFolderResource(() => submitData);

	onMount(() => {
		inputRef?.focus();
	});

	const onsubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		await addFolder.refetch();

		onBlur();
	};
</script>

<form {onsubmit}>
	<Input
		type="text"
		name="folderName"
		onblur={onBlur}
		placeholder="Folder Name"
		bind:ref={inputRef}
		bind:value
		class="rounded-sm"
	/>
</form>
