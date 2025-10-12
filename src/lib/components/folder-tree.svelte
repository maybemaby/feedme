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
	import { FolderOpen, FolderClosed } from '@lucide/svelte';

	let {
		node,
		onFolderClick,
		onItemClick,
		onFolderToggle,
		openFolders
	}: {
		node: FolderTreeNode;
		onFolderClick?: (name: string | number) => void;
		onItemClick?: (name: string | number) => void;
		onFolderToggle?: (name: string | number) => void;
		openFolders?: Set<string | number>;
	} = $props();

	let open = $derived.by(() => (openFolders ? openFolders.has(node.id) : false));

	const toggle = () => {
		open = !open;
		onFolderToggle?.(node.id);
	};
</script>

{#if node.type === 'folder'}
	<div>
		<div class="flex gap-2">
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
		</div>
		<div class="ml-4">
			{#if open}
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
