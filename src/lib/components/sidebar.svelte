<script lang="ts">
	import { Inbox, ChevronUp, Plus } from '@lucide/svelte';
	import { Button, buttonVariants } from './ui/button/index';
	import FolderTree, { type FolderTreeNode } from './folder-tree.svelte';
	import AddFolder from './add-folder.svelte';
	import * as Collapsible from './ui/collapsible/index';

	let { folderNodes }: { folderNodes?: FolderTreeNode[] } = $props();
	let foldersOpen = $state(true);
	let addingFolder = $state(false);

	const onTreeItemClick = (name: string | number) => {
		console.log('Clicked on item:', name);
	};

	const nodes: FolderTreeNode[] = [
		{
			id: 'folder-1',
			label: 'Folder 1',
			type: 'folder',
			children: [
				{ id: 'feed-1', label: 'Feed 1', type: 'item' },
				{ id: 'feed-2', label: 'Feed 2', type: 'item' }
			]
		},
		{
			id: 'folder-2',
			label: 'Folder 2',
			type: 'folder',
			children: [
				{ id: 'feed-3', label: 'Feed 3', type: 'item' },
				{
					id: 'folder-3',
					label: 'Subfolder 1',
					type: 'folder',
					children: [{ id: 'feed-4', label: 'Feed 4', type: 'item' }]
				}
			]
		},
		{ id: 'feed-5', label: 'Feed 5', type: 'item' }
	];
</script>

<div class="p-4">
	<a
		href="/"
		class="bg-primary text-primary-foreground mb-4 flex items-center justify-center gap-2 border p-2"
	>
		<Inbox size={20} /> All Feeds</a
	>
	<Button
		variant="secondary"
		href="/feeds/manage"
		class="border-foreground w-full rounded-none border shadow-none">Manage Feeds</Button
	>

	<div class="my-8">
		<Collapsible.Root bind:open={foldersOpen}>
			<div class="flex items-center gap-2 pb-2">
				Folders
				<Collapsible.Trigger
					class={[buttonVariants({ variant: 'ghost', size: 'icon' }), 'group ml-auto']}
				>
					<ChevronUp size={16} class="transition-transform group-data-[state=closed]:rotate-180" />
				</Collapsible.Trigger>
				<Button variant="ghost" size="icon" onclick={() => (addingFolder = true)}>
					<Plus />
				</Button>
			</div>
			{#if addingFolder}
				<div class="mb-2">
					<AddFolder onBlur={() => (addingFolder = false)} />
				</div>
			{/if}

			<Collapsible.Content>
				{#each folderNodes as node (node.id)}
					<FolderTree {node} onFolderClick={onTreeItemClick} onItemClick={onTreeItemClick} />
				{/each}
				<!-- {#each nodes as node (node.id)}
					<FolderTree {node} onFolderClick={onTreeItemClick} onItemClick={onTreeItemClick} />
				{/each} -->
			</Collapsible.Content>
		</Collapsible.Root>
	</div>
</div>
