<script module lang="ts">
	export type FolderTreeNode = {
		id: string;
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
		onItemClick
	}: {
		node: FolderTreeNode;
		onFolderClick?: (name: string) => void;
		onItemClick?: (name: string) => void;
	} = $props();
	let open = $state(false);
</script>

{#if node.type === 'folder'}
	<div>
		<div class="flex gap-2">
			<button onclick={() => (open = !open)} aria-label="Toggle Folder">
				<span class="sr-only">Toggle Folder {node.label}</span>
				{#if open}
					<FolderOpen />
				{:else}
					<FolderClosed />
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
					{#each node.children as child}
						<FolderTree node={child} {onFolderClick} {onItemClick} />
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
