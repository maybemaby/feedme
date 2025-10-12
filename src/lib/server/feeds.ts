import { err, ok } from 'neverthrow';
import { parseFeed, type AtomFeed, type RssFeed } from 'feedsmith';

type FeedItem = {
	title: string;
	url: string;
	sourceName: string;
	description?: string;
	image?: string;
	publishedAt?: Date;
};

export async function getFeedContent(url: string) {
	const res = await fetch(url);

	if (!res.ok) {
		return err({
			message: `Failed to fetch feed: ${res.status} ${res.statusText}`,
			status: res.status,
			url: url
		});
	}

	const text = await res.text();
	return ok(text);
}

export function parseFeedContent(feedContent: string) {
	try {
		const { format, feed } = parseFeed(feedContent);

		if (format === 'rss') {
			const transformRes = transformRss(feed as RssFeed<Date>);
			return transformRes;
		} else if (format === 'atom') {
			const transformRes = transformAtom(feed as AtomFeed<string>);
			return transformRes;
		} else {
			return err({ message: `Unsupported feed format: ${format}` });
		}
	} catch (e: unknown) {
		return err({ message: 'Failed to parse feed', error: e });
	}
}

function transformRss(feed: RssFeed<Date>) {
	if (!feed.items) {
		return err({ message: 'No items in feed' });
	}

	return ok(
		feed.items.map((item) => {
			/**
			 * References:
			 * https://cprss.s3.amazonaws.com/golangweekly.com.xml
			 */
			// @ts-ignore
			const publishField = item.pubDate || item.date_published;
			// @ts-ignore
			const urlField = item.link;

			return {
				title: item.title || 'No title',
				url: urlField || '',
				sourceName: feed.title,
				description: item.description,
				image: item.media?.thumbnails?.[0]?.url,
				publishedAt: publishField ? new Date(publishField) : undefined
			} satisfies FeedItem;
		})
	);
}

export function transformAtom(feed: AtomFeed<string>) {
	if (!feed.entries) {
		return err({ message: 'No items in feed' });
	}

	return ok(
		feed.entries.map((item) => {
			const publishField = item.updated || item.published;
			return {
				title: item.title,
				sourceName: feed.title,
				url: item.links?.[0]?.href || item.id,
				description: item.content || item.summary,
				image: item.media?.thumbnails?.[0]?.url,
				publishedAt: publishField ? new Date(publishField) : new Date()
			} satisfies FeedItem;
		})
	);
}
