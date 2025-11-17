import { resource, type Getter } from 'runed';
import { invalidate } from '$app/navigation';
import type { AddFolderRequest } from '$lib/folders.remote';

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
