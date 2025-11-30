<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import * as Select from './ui/select';
	import { getFolders } from '$lib/folders.remote';

	let {
		...rest
	}: { value: string | undefined } & Omit<
		ComponentProps<typeof Select.Root>,
		'type' | 'onValueChange' | 'value'
	> = $props();

	let interimValue = $derived(rest.value ?? '');
	let { folders } = await getFolders();

	let label = $derived.by(() => {
		const folder = folders.find((f) => f.id.toString() === interimValue);
		return folder ? folder.name : 'Select Folder';
	});

	const folderOptions = $derived.by(() => {
		return folders.map((folder) => ({
			...folder,
			label: folder.folderPath.replaceAll('.', '/')
		}));
	});
</script>

<Select.Root type="single" {...rest} onValueChange={(value) => (interimValue = value)}>
	<Select.Trigger class="w-[180px]">
		{label}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each folderOptions as option (option.id)}
				<Select.Item value={option.id.toString()}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
