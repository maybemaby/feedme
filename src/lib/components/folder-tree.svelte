<script module lang="ts">
	export type FolderTreeNode = {
		id: string | number;
		label: string;
		type: 'folder' | 'item';
		children?: FolderTreeNode[];
	};
</script>

<script lang="ts">
	import FolderTree from './folder-tree.svelte';
	import { FolderOpen, FolderClosed, Plus, EllipsisVertical, Trash, Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as Dropdown from './ui/dropdown-menu/index';
	import AddFolder from './add-folder.svelte';
	import { deleteFolderResource, updateFolderResource } from '$lib/hooks/folders.svelte';
	import { Input } from './ui/input';

	let {
		node,
		onFolderClick,
		onItemClick,
		onFolderToggle,
		openFolders,
		onDeleteFolder
	}: {
		node: FolderTreeNode;
		onFolderClick?: (name: string | number) => void;
		onItemClick?: (name: string | number) => void;
		onFolderToggle?: (name: string | number) => void;
		onDeleteFolder?: (name: string | number) => void;
		openFolders?: Set<string | number>;
	} = $props();

	let addingFolder = $state(false);
	let editingName = $state(false);
	let newName = $state(node.label);
	let open = $derived.by(() => (openFolders ? openFolders.has(node.id) : false));

	let editFolderRef = $state<HTMLInputElement | null>(null);

	const deleteFolder = deleteFolderResource(() => node.id as number);
	const editFolder = updateFolderResource(
		() => node.id as number,
		() => ({
			name: newName
		})
	);

	const toggle = () => {
		open = !open;
		onFolderToggle?.(node.id);
	};

	const onAddClick = () => {
		open = true;
		addingFolder = true;
	};

	const onDelete = async () => {
		// TODO: Figure out a way to separate the tree UI the app specific delete logic?
		await deleteFolder.refetch();
		onDeleteFolder?.(node.id);
	};

	const onSubmitRename = async (event: SubmitEvent) => {
		event.preventDefault();

		await editFolder.refetch();
		editingName = false;
	};

	$effect(() => {
		if (deleteFolder.error) {
			toast.error(deleteFolder.error.message);
		}
	});

	$effect(() => {
		if (editingName) {
			editFolderRef?.focus();
		}
	});
</script>

{#if node.type === 'folder'}
	<div>
		<div class="group flex gap-2">
			<button onclick={toggle} aria-label="Toggle Folder">
				<span class="sr-only">Toggle Folder {node.label}</span>
				{#if open}
					<FolderOpen size={16} />
				{:else}
					<FolderClosed size={16} />
				{/if}
			</button>

			{#if editingName}
				<form onsubmit={onSubmitRename}>
					<Input
						type="text"
						name="folderName"
						placeholder="Folder Name"
						bind:ref={editFolderRef}
						onblur={() => {
							editingName = false;
							newName = node.label;
						}}
						class="rounded-none focus-visible:ring-0"
						bind:value={newName}
					/>
				</form>
			{:else}
				<button
					onclick={() => onFolderClick?.(node.id)}
					class="hover:bg-muted/70 w-full p-1 text-start">{node.label}</button
				>
			{/if}
			<Dropdown.Root>
				<Dropdown.Trigger>
					<EllipsisVertical size={14} />
				</Dropdown.Trigger>
				<Dropdown.Content align="end">
					<Dropdown.Group>
						<Dropdown.Item onclick={onAddClick}>
							<Plus size={14} />
							Add Subfolder</Dropdown.Item
						>
						<Dropdown.Item onclick={() => (editingName = true)}>
							<Pencil size={14} /> Rename
						</Dropdown.Item>
						<Dropdown.Item onclick={onDelete}>
							<Trash size={14} />
							Delete Folder</Dropdown.Item
						>
					</Dropdown.Group>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
		<div class="ml-4">
			{#if open}
				{#if addingFolder}
					<div class="mr-4 mb-2">
						<AddFolder onBlur={() => (addingFolder = false)} parentId={node.id as number} />
					</div>
				{/if}
				{#if node.children}
					{#each node.children as child (child.id)}
						<FolderTree node={child} {onFolderClick} {onItemClick} {onFolderToggle} {openFolders} />
					{/each}
				{/if}
			{/if}
		</div>
	</div>
{:else}
	<button class="hover:bg-muted/70 w-full p-1 text-start" onclick={() => onItemClick?.(node.id)}
		>{node.label}</button
	>
{/if}
