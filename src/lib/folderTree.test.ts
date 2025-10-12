import { describe, it, expect } from 'vitest';
import type { FolderTreeNode } from './components/folder-tree.svelte';
import { addChildAtPath } from './folderTree';

describe('addChildAtPath', () => {
	it('should add child at root level', () => {
		const root: FolderTreeNode = {
			id: 'root',
			label: 'Root',
			type: 'folder',
			children: []
		};

		const child: FolderTreeNode = {
			id: 'child1',
			label: 'Child1',
			type: 'folder',
			children: []
		};

		addChildAtPath(root, child, 'Root.Child1');

		expect(root.children).toHaveLength(1);
		expect(root.children?.[0]).toEqual(child);
	});

	it('should add child at root level with no existing children', () => {
		const root: FolderTreeNode = {
			id: 'root',
			label: 'Root',
			type: 'folder'
		};

		const child: FolderTreeNode = {
			id: 'child1',
			label: 'Child1',
			type: 'folder',
			children: []
		};

		addChildAtPath(root, child, 'Root.Child1');

		expect(root.children).toHaveLength(1);
		expect(root.children?.[0]).toEqual(child);
	});

	it('should add child at nested level', () => {
		const root: FolderTreeNode = {
			id: 'root',
			label: 'Root',
			type: 'folder',
			children: [
				{
					id: 'child1',
					label: 'Child1',
					type: 'folder',
					children: []
				}
			]
		};

		const grandChild: FolderTreeNode = {
			id: 'grandchild1',
			label: 'GrandChild1',
			type: 'folder',
			children: []
		};

		addChildAtPath(root, grandChild, 'Root.Child1.GrandChild1');

		expect(root.children?.[0].children).toHaveLength(1);
		expect(root.children?.[0].children?.[0]).toEqual(grandChild);
	});

	it('should throw error for invalid path', () => {
		const root: FolderTreeNode = {
			id: 'root',
			label: 'Root',
			type: 'folder',
			children: []
		};

		const child: FolderTreeNode = {
			id: 'child1',
			label: 'Child1',
			type: 'folder',
			children: []
		};

		expect(() => addChildAtPath(root, child, 'Root.NonExistent.Child1')).toThrowError(
			'Folder path not found: Root.NonExistent.Child1 part: NonExistent'
		);
	});

	it('should add child at correct path in complex tree', () => {
		const root: FolderTreeNode = {
			id: 'root',
			label: 'Root',
			type: 'folder',
			children: [
				{
					id: 'child1',
					label: 'Child1',
					type: 'folder',
					children: [
						{
							id: 'grandchild1',
							label: 'GrandChild1',
							type: 'folder',
							children: []
						}
					]
				},
				{
					id: 'child2',
					label: 'Child2',
					type: 'folder',
					children: []
				}
			]
		};

		const newGrandChild: FolderTreeNode = {
			id: 'grandchild2',
			label: 'GrandChild2',
			type: 'folder',
			children: []
		};

		addChildAtPath(root, newGrandChild, 'Root.Child2.GrandChild2');

		expect(root.children?.[1].children).toHaveLength(1);
		expect(root.children?.[1].children?.[0]).toEqual(newGrandChild);
	});
});
