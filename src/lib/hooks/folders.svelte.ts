import { resource, type Getter } from 'runed';
import type { AddFolderRequest } from '../../routes/api/folders/+server';
import type { SelectFolder } from '$lib/server/db/sqlite-schema';
import { invalidate } from '$app/navigation';

export const addFolderResource = (data: Getter<AddFolderRequest>) => {
	return resource(
		() => null,
		async (id, prevId, { signal }) => {
			const res = await fetch('/api/folders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				signal,
				body: JSON.stringify(data())
			});

			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || 'Failed to add folder');
			}

			invalidate('folders');

			return null;
		},
		{ lazy: true }
	);
};

export const getFoldersResource = () => {
	const foldersResource = resource(
		() => 'folders',
		async (_id, _prevId, { signal }) => {
			const res = await fetch('/api/folders', { signal });

			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || 'Failed to fetch folders');
			}

			return res.json() as Promise<{ folders: SelectFolder[] }>;
		}
	);

	return foldersResource;
};

export const deleteFolderResource = (folderId: Getter<number>) => {
	return resource(
		() => `delete-folder`,
		async (id, prevId, { signal }) => {
			const res = await fetch(`/api/folders/${folderId()}`, {
				method: 'DELETE',
				signal
			});

			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || 'Failed to delete folder');
			}

			invalidate('folders');

			return null;
		},
		{
			lazy: true
		}
	);
};

export const updateFolderResource = (folderId: Getter<number>, data: Getter<AddFolderRequest>) => {
	return resource(
		() => `update-folder`,
		async (id, prevId, { signal }) => {
			const res = await fetch(`/api/folders/${folderId()}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				signal,
				body: JSON.stringify(data())
			});

			if (!res.ok) {
				const errorData = await res.text();
				throw new Error(errorData || 'Failed to update folder');
			}

			invalidate('folders');
			return null;
		},
		{
			lazy: true
		}
	);
};
