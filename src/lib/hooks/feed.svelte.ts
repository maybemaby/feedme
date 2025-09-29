import { resource, type Getter } from 'runed';
import type { PostFeedResponse } from '../../routes/api/feeds/+server';
export function addFeedResource(url: Getter<string>) {
	const feedResource = resource(
		() => null,
		async () => {
			const res = await fetch('/api/feeds', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
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
