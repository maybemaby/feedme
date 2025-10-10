import { resource, type Getter } from 'runed';
import type { AddFolderRequest } from '../../routes/api/folders/+server';

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

			return null;
		},
		{ lazy: true }
	);
};
