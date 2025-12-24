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
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import FolderClosed from '@lucide/svelte/icons/folder-closed';
	import Plus from '@lucide/svelte/icons/plus';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Trash from '@lucide/svelte/icons/trash';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { toast } from 'svelte-sonner';
	import * as Dropdown from './ui/dropdown-menu/index';
	import AddFolder from './add-folder.svelte';
	import { deleteFolder, updateFolder } from '$lib/folders.remote';
	import { Input } from './ui/input';
	import { invalidate } from '$app/navigation';

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

	let blockBlur = $state(false);
	let blockBlurTimeout = $state<ReturnType<typeof setTimeout> | null>(null);
	let addingFolder = $state(false);
	let editingName = $state(false);
	let newName = $state(node.label);
	let open = $derived.by(() => (openFolders ? openFolders.has(node.id) : false));
	let activeName = $state(node.label);

	let editFolderRef = $state<HTMLInputElement | null>(null);

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

		try {
			await deleteFolder({ folderId: node.id.toString() });
			onDeleteFolder?.(node.id);
			invalidate('folders');
		} catch (e) {
			console.error('Failed to delete folder:', e);
			toast.error('Failed to delete folder.');
		}
	};

	const onSubmitRename = async (event: SubmitEvent) => {
		event.preventDefault();

		await updateFolder({
			id: node.id,
			name: newName
		});

		editingName = false;
		activeName = newName;
		invalidate('folders');
	};

	$effect(() => {
		if (editingName) {
			editFolderRef?.focus();
		}
	});

	$effect(() => {
		return () => {
			if (blockBlurTimeout) {
				clearTimeout(blockBlurTimeout);
			}
		};
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
							if (blockBlur) return;
							editingName = false;
						}}
						class="rounded-none focus-visible:ring-0"
						bind:value={newName}
					/>
				</form>
			{:else}
				<button
					onclick={() => onFolderClick?.(node.id)}
					class="hover:bg-muted/70 w-full p-1 text-start">{activeName}</button
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
						<Dropdown.Item
							onclick={() => {
								editingName = true;
								blockBlur = true;
								if (blockBlurTimeout) clearTimeout(blockBlurTimeout);
								blockBlurTimeout = setTimeout(() => {
									blockBlur = false;
								}, 200);
							}}
						>
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
		>{activeName}</button
	>
{/if}
