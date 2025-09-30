import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import FolderTree, { type FolderTreeNode } from './folder-tree.svelte';

describe('FolderTree', () => {
	const mockFolderNode: FolderTreeNode = {
		id: 'root',
		label: 'Root Folder',
		type: 'folder',
		children: [
			{
				id: 'child1',
				label: 'Child Folder 1',
				type: 'folder',
				children: [
					{
						id: 'grandchild1',
						label: 'Grandchild Item 1',
						type: 'item'
					},
					{
						id: 'grandchild2',
						label: 'Grandchild Item 2',
						type: 'item'
					}
				]
			},
			{
				id: 'child2',
				label: 'Child Item 1',
				type: 'item'
			},
			{
				id: 'child3',
				label: 'Child Folder 2',
				type: 'folder',
				children: [
					{
						id: 'grandchild3',
						label: 'Grandchild Item 3',
						type: 'item'
					}
				]
			}
		]
	};

	const mockItemNode: FolderTreeNode = {
		id: 'item1',
		label: 'Test Item',
		type: 'item'
	};

	it('renders the top level folder node and no children by default', () => {
		render(FolderTree, { node: mockFolderNode });

		// Top level folder should be visible
		expect(screen.getByText('Root Folder')).toBeInTheDocument();
		expect(screen.getByLabelText('Toggle Folder')).toBeInTheDocument();

		// Children should not be visible initially (folder is closed)
		expect(screen.queryByText('Child Folder 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Child Item 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Child Folder 2')).not.toBeInTheDocument();
	});

	it('renders item nodes without toggle button', () => {
		render(FolderTree, { node: mockItemNode });

		expect(screen.getByText('Test Item')).toBeInTheDocument();
		expect(screen.queryByLabelText('Toggle Folder')).not.toBeInTheDocument();
	});

	it('expanding the top level node shows the next level of children', async () => {
		render(FolderTree, { node: mockFolderNode });

		// Initially children are not visible
		expect(screen.queryByText('Child Folder 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Child Item 1')).not.toBeInTheDocument();

		// Click the toggle button to expand
		const toggleButton = screen.getByLabelText('Toggle Folder');
		await fireEvent.click(toggleButton);

		// First level children should now be visible
		expect(screen.getByText('Child Folder 1')).toBeInTheDocument();
		expect(screen.getByText('Child Item 1')).toBeInTheDocument();
		expect(screen.getByText('Child Folder 2')).toBeInTheDocument();

		// Grandchildren should still not be visible (their parent folders are closed)
		expect(screen.queryByText('Grandchild Item 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Grandchild Item 2')).not.toBeInTheDocument();
		expect(screen.queryByText('Grandchild Item 3')).not.toBeInTheDocument();
	});

	it('all children are rendered when their parent folders are expanded', async () => {
		render(FolderTree, { node: mockFolderNode });

		// Expand root folder
		const rootToggle = screen.getByLabelText('Toggle Folder');
		await fireEvent.click(rootToggle);

		// Now expand Child Folder 1
		const childFolder1 = screen.getByText('Child Folder 1');
		expect(childFolder1).toBeInTheDocument();

		// Find the toggle button for Child Folder 1 (it should be the first button in the child folder row)
		const childFolder1Row = childFolder1.closest('div');
		const childFolder1Toggle = childFolder1Row?.querySelector('button[aria-label="Toggle Folder"]');
		expect(childFolder1Toggle).toBeInTheDocument();

		await fireEvent.click(childFolder1Toggle!);

		// Grandchildren of Child Folder 1 should now be visible
		expect(screen.getByText('Grandchild Item 1')).toBeInTheDocument();
		expect(screen.getByText('Grandchild Item 2')).toBeInTheDocument();

		// Expand Child Folder 2
		const childFolder2 = screen.getByText('Child Folder 2');
		const childFolder2Row = childFolder2.closest('div');
		const childFolder2Toggle = childFolder2Row?.querySelector('button[aria-label="Toggle Folder"]');

		await fireEvent.click(childFolder2Toggle!);

		// Grandchild of Child Folder 2 should now be visible
		expect(screen.getByText('Grandchild Item 3')).toBeInTheDocument();

		// All nodes should be visible now
		expect(screen.getByText('Root Folder')).toBeInTheDocument();
		expect(screen.getByText('Child Folder 1')).toBeInTheDocument();
		expect(screen.getByText('Child Item 1')).toBeInTheDocument();
		expect(screen.getByText('Child Folder 2')).toBeInTheDocument();
		expect(screen.getByText('Grandchild Item 1')).toBeInTheDocument();
		expect(screen.getByText('Grandchild Item 2')).toBeInTheDocument();
		expect(screen.getByText('Grandchild Item 3')).toBeInTheDocument();
	});

	it('closing a folder hides the children', async () => {
		render(FolderTree, { node: mockFolderNode });

		// Expand root folder
		const rootToggle = screen.getByLabelText('Toggle Folder');
		await fireEvent.click(rootToggle);

		// Children should be visible
		expect(screen.getByText('Child Folder 1')).toBeInTheDocument();
		expect(screen.getByText('Child Item 1')).toBeInTheDocument();

		// Close the folder
		await fireEvent.click(rootToggle);

		// Children should be hidden again
		expect(screen.queryByText('Child Folder 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Child Item 1')).not.toBeInTheDocument();
		expect(screen.queryByText('Child Folder 2')).not.toBeInTheDocument();
	});

	it('calls onFolderClick when a folder is clicked', async () => {
		const onFolderClick = vi.fn();
		render(FolderTree, {
			node: mockFolderNode,
			onFolderClick
		});

		const folderButton = screen.getByText('Root Folder');
		await fireEvent.click(folderButton);

		expect(onFolderClick).toHaveBeenCalledWith('root');
	});

	it('calls onItemClick when an item is clicked', async () => {
		const onItemClick = vi.fn();
		render(FolderTree, {
			node: mockItemNode,
			onItemClick
		});

		const itemButton = screen.getByText('Test Item');
		await fireEvent.click(itemButton);

		expect(onItemClick).toHaveBeenCalledWith('item1');
	});

	it('calls onItemClick for child items when they are visible and clicked', async () => {
		const onItemClick = vi.fn();
		render(FolderTree, {
			node: mockFolderNode,
			onItemClick
		});

		// Expand root folder to show children
		const rootToggle = screen.getByLabelText('Toggle Folder');
		await fireEvent.click(rootToggle);

		// Click on a child item
		const childItem = screen.getByText('Child Item 1');
		await fireEvent.click(childItem);

		expect(onItemClick).toHaveBeenCalledWith('child2');
	});

	it('shows correct icon states for folder open/closed', async () => {
		render(FolderTree, { node: mockFolderNode });

		const toggleButton = screen.getByLabelText('Toggle Folder');

		// Initially should show closed folder icon (FolderClosed component)
		// We can't easily test the specific icon component, but we can test the toggle behavior

		// Click to open
		await fireEvent.click(toggleButton);

		// Children should be visible (indicating folder is open)
		expect(screen.getByText('Child Folder 1')).toBeInTheDocument();

		// Click to close
		await fireEvent.click(toggleButton);

		// Children should be hidden (indicating folder is closed)
		expect(screen.queryByText('Child Folder 1')).not.toBeInTheDocument();
	});

	it('handles folders with no children gracefully', async () => {
		const emptyFolderNode: FolderTreeNode = {
			id: 'empty',
			label: 'Empty Folder',
			type: 'folder'
			// No children property
		};

		render(FolderTree, { node: emptyFolderNode });

		expect(screen.getByText('Empty Folder')).toBeInTheDocument();

		// Should be able to toggle without errors
		const toggleButton = screen.getByLabelText('Toggle Folder');
		await fireEvent.click(toggleButton);

		// No children should appear (and no errors should occur)
		expect(screen.getByText('Empty Folder')).toBeInTheDocument();
	});
});
