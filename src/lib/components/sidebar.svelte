<script lang="ts">
	import { Inbox, ChevronUp, Plus } from '@lucide/svelte';
	import { Button, buttonVariants } from './ui/button/index';
	import FolderTree, { type FolderTreeNode } from './folder-tree.svelte';
	import AddFolder from './add-folder.svelte';
	import * as Collapsible from './ui/collapsible/index';
	import { goto } from '$app/navigation';
	import { getFolderTreeState } from '$lib/state/folderTree.svelte';

	let { folderNodes }: { folderNodes?: FolderTreeNode[] } = $props();
	let foldersOpen = $state(true);
	let addingFolder = $state(false);

	const folderTreeState = getFolderTreeState();

	const onFolderClick = (name: string | number) => {
		// folderTreeState.toggleFolder(name as string);
		console.log('Clicked on folder:', name);
	};

	const onToggle = (name: string | number) => {
		folderTreeState.toggleFolder(name as string);
	};

	const onItemClick = (name: string | number) => {
		goto(`/feeds/view/${name}`);
	};
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
			<div class="flex items-center gap-2 pb-1">
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

			<Collapsible.Content
				hiddenUntilFound
				class="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden"
			>
				{#each folderNodes as node (node.id)}
					<FolderTree
						{node}
						onFolderToggle={onToggle}
						{onItemClick}
						openFolders={folderTreeState.openFolders}
					/>
				{/each}
				<!-- {#each nodes as node (node.id)}
					<FolderTree {node} onFolderClick={onTreeItemClick} onItemClick={onTreeItemClick} />
				{/each} -->
			</Collapsible.Content>
		</Collapsible.Root>
	</div>
</div>
