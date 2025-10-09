import { eq } from 'drizzle-orm';
import { err, ok } from 'neverthrow';
import { type Logger } from 'pino';
import { db } from '../db';
import { feeds } from '../db/sqlite-schema';
import { getFeedContent, parseFeedContent } from '../feeds';
import { upsertFeedItems } from '../feeds-service';

export async function refreshFeed(feedId: string, logger?: Logger) {
	const [feed] = await db.select().from(feeds).where(eq(feeds.id, feedId));

	if (!feed) {
		return err({ cause: 'feed-not-found' as const, message: 'Feed not found' });
	}

	const contentRes = await getFeedContent(feed.url);

	if (contentRes.isErr()) {
		return err({
			cause: 'fetch-error' as const,
			message: 'Failed to fetch feed content',
			status: contentRes.error.status,
			url: contentRes.error.url,
			contentErrMessage: contentRes.error.message
		});
	}

	const parseRes = parseFeedContent(contentRes.value);

	if (parseRes.isErr()) {
		return err({ cause: 'parse-error' as const, message: 'Failed to parse feed content' });
	}

	const feedItems = parseRes.value.map((item) => ({
		url: item.url,
		title: item.title,
		feedId: feed.id,
		publishedAt: item.publishedAt || new Date(),
		createdAt: new Date(),
		content: item.description || ''
	}));

	try {
		await upsertFeedItems(feedItems);

		await db.update(feeds).set({ refreshedAt: new Date() }).where(eq(feeds.id, feed.id));
		return ok({ feed, newItems: feedItems.length });
	} catch (e) {
		logger?.error({ err: e }, 'Error upserting feed items or updating feed');
		return err({ cause: 'db-error' as const, message: 'Database error', error: e });
	}
}
