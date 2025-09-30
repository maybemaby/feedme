import { resource, type Getter } from 'runed';
import type { PostFeedResponse } from '../../routes/api/feeds/+server';
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
