<script lang="ts">
	import * as Select from './ui/select';
	import { getFoldersResource } from '$lib/hooks/folders.svelte';

	let props: { name?: string; id?: string; initialValue?: string | null } = $props();

	const foldersResource = getFoldersResource();

	let value = $state(props.initialValue ?? '');

	let label = $derived.by(() => {
		const folder = foldersResource.current?.folders.find((f) => f.id.toString() === value);
		return folder ? folder.name : 'Select Folder';
	});

	const options = $derived.by(() => {
		return (
			foldersResource.current?.folders.map((folder) => ({
				...folder,
				label: folder.folderPath.replaceAll('.', '/')
			})) || []
		);
	});
</script>

<Select.Root type="single" {...props} bind:value>
	<Select.Trigger class="w-[180px]">
		{label}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each options as option (option.id)}
				<Select.Item value={option.id.toString()}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
