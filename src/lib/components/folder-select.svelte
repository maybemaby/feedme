<script lang="ts">
	import * as Select from './ui/select';
	import { getFolders } from '$lib/folders.remote';

	let props: { name?: string; id?: string; initialValue?: string | null } = $props();

	let value = $derived(props.initialValue ?? '');

	let label = $derived.by(() => {
		const folder = getFolders().current?.folders.find((f) => f.id.toString() === value);
		return folder ? folder.name : 'Select Folder';
	});

	const folderOptions = $derived.by(async () => {
		const folders = await getFolders();
		return folders.folders.map((folder) => ({
			...folder,
			label: folder.folderPath.replaceAll('.', '/')
		}));
	});
</script>

<Select.Root type="single" {...props} bind:value>
	<Select.Trigger class="w-[180px]">
		{label}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#await folderOptions then options}
				{#each options as option (option.id)}
					<Select.Item value={option.id.toString()}>
						{option.label}
					</Select.Item>
				{/each}
			{/await}
		</Select.Group>
	</Select.Content>
</Select.Root>
