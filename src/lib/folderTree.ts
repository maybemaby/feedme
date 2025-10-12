import type { FolderTreeNode } from './components/folder-tree.svelte';

export function addChildAtPath(node: FolderTreeNode, child: FolderTreeNode, path: string) {
	const parts = path.split('.');

	let currentNode: FolderTreeNode | undefined = node;

	if (parts.length === 2) {
		currentNode.children = currentNode.children || [];
		currentNode.children.push(child);
		return;
	}

	// Skip the root
	for (let i = 1; i < parts.length; i++) {
		currentNode.children = currentNode.children || [];

		if (i === parts.length - 1) {
			currentNode.children.push(child);
			return;
		}

		const part = parts[i];

		currentNode = currentNode.children.find((n) => n.label === part);

		if (!currentNode) {
			throw new Error('Folder path not found: ' + path + ' part: ' + part);
		}
	}
}
