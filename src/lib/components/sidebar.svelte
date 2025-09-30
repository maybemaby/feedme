<script lang="ts">
	import { Inbox } from '@lucide/svelte';
	import FolderTree, { type FolderTreeNode } from './folder-tree.svelte';

	const onTreeItemClick = (name: string) => {
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

<aside class="bg-card hidden h-full w-[300px] border-r lg:block">
	<div class="p-4">
		<a href="/" class="flex items-center gap-2"> <Inbox /> All Feeds</a>

		<div class="my-8">
			{#each nodes as node}
				<FolderTree {node} onFolderClick={onTreeItemClick} onItemClick={onTreeItemClick} />
			{/each}
		</div>
	</div>
</aside>
