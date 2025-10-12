import { and, eq, or, isNull, lte, inArray } from 'drizzle-orm';
import { getDb } from './db/db';
import { feeds } from './db/sqlite-schema';
import { Ok, ok } from 'neverthrow';
import { getFeedContent, parseFeedContent } from './feeds';
import type { Logger } from 'pino';
import type { OKResult } from '$lib/utils';
import { upsertFeedItems } from './feeds-service';

export async function refreshFeedsForUser(userId: string, logger?: Logger) {
	const feedsRes = await getDb()
		.select()
		.from(feeds)
		.where(
			and(
				eq(feeds.userId, userId),
				or(
					lte(feeds.refreshedAt, new Date(Date.now() - 8 * 60 * 60 * 1000)), // 8 hours
					isNull(feeds.refreshedAt)
				)
			)
		);

	if (feedsRes.length === 0) {
		return ok({ message: 'No feeds to refresh' });
	}

	const contentRes = await Promise.all(
		feedsRes.map((feed) => {
			return getFeedContent(feed.url);
		})
	);

	type FeedRes = (typeof feedsRes)[number];
	type ContentResult = (typeof contentRes)[number];

	const failedContents: {
		feed: FeedRes;
		content: ContentResult;
	}[] = [];
	const okContents: { feed: FeedRes; content: Ok<string, never> }[] = [];

	for (let i = 0; i < contentRes.length; i++) {
		const content = contentRes[i];
		const feed = feedsRes[i];

		if (content.isErr()) {
			failedContents.push({ content, feed });
		} else {
			okContents.push({ content, feed });
		}
	}

	if (failedContents.length > 0) {
		logger?.error(
			{
				failedContents
			},
			`Failed to refresh ${failedContents.length} feeds`
		);
	}

	const failedParses: { feed: FeedRes; error: string }[] = [];
	const parseResults: {
		feed: FeedRes;
		items: OKResult<ReturnType<typeof parseFeedContent>>['value'];
	}[] = [];

	for (const okRes of okContents) {
		const parseRes = parseFeedContent(okRes.content.value);

		if (parseRes.isOk()) {
			parseResults.push({ feed: okRes.feed, items: parseRes.value });
		} else {
			failedParses.push({ feed: okRes.feed, error: parseRes.error.message });
			logger?.error(
				{
					feed: okRes.feed,
					error: parseRes.error.message
				},
				`Failed to parse feed content`
			);
		}
	}

	const feedData = parseResults.flatMap((r) => {
		return r.items.map((i) => ({
			url: i.url,
			title: i.title,
			feedId: r.feed.id,
			publishedAt: i.publishedAt || new Date(),
			createdAt: new Date(),
			content: i.description || ''
		}));
	});

	await upsertFeedItems(feedData);

	await getDb()
		.update(feeds)
		.set({ refreshedAt: new Date() })
		.where(
			inArray(
				feeds.id,
				feedData.map((f) => f.feedId)
			)
		);

	const failedFeeds: string[] = [];

	for (const failedParse of failedParses) {
		failedFeeds.push(failedParse.feed.name);
	}
	for (const failedContent of failedContents) {
		failedFeeds.push(failedContent.feed.name);
	}

	return ok({
		refreshed: parseResults,
		failedFeeds
	});
}
