import { resource, type Getter } from 'runed';
import type { PostFeedResponse } from '../../routes/api/feeds/+server';
import type { SelectFeed } from '$lib/server/db/sqlite-schema';
import * as z from 'zod';

export const editFeedSchema = z.object({
	url: z.url().optional(),
	folderId: z.coerce.number().optional()
});

export function addFeedResource(url: Getter<string>) {
	const feedResource = resource(
		() => null,
		async (_id, _prevId, { signal }) => {
			const res = await fetch('/api/feeds', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				signal,
				body: JSON.stringify({ url: url() })
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Failed to add feed');
			}

			const data = (await res.json()) as PostFeedResponse;

			return data;
		},
		{
			lazy: true
		}
	);

	return feedResource;
}

export function refreshFeedResource() {
	const refreshResource = resource(
		() => null,
		async (_id, _prevId, { signal }) => {
			const res = await fetch('/api/feeds/refresh', { method: 'POST', signal });

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Failed to refresh feeds');
			}

			return res.json();
		},
		{
			lazy: true
		}
	);

	return refreshResource;
}

export function getFeedsResource() {
	const feedsResource = resource(
		() => null,
		async (_id, _prevId, { signal }) => {
			const res = await fetch('/api/feeds', { signal });

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Failed to fetch feeds');
			}

			return res.json() as Promise<{ feeds: SelectFeed[] }>;
		}
	);

	return feedsResource;
}
