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
	import { deleteFolderResource } from '$lib/hooks/folders.svelte';

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
	let open = $derived.by(() => (openFolders ? openFolders.has(node.id) : false));
	const deleteFolder = deleteFolderResource(() => node.id as number);

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

	$effect(() => {
		if (deleteFolder.error) {
			toast.error(deleteFolder.error.message);
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
			<button
				onclick={() => onFolderClick?.(node.id)}
				class="hover:bg-muted/70 w-full p-1 text-start">{node.label}</button
			>
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
						<Dropdown.Item>
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
