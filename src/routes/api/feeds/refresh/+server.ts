import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { and, eq, inArray, isNull, lte, or } from 'drizzle-orm';
import { getFeedContent, parseFeedContent } from '$lib/server/feeds';
import type { Ok } from 'neverthrow';
import type { OKResult } from '$lib/utils';
import { upsertFeedItems } from '$lib/server/feeds-service';

export const POST: RequestHandler = async (event) => {
	const userId = event.locals.session?.user.id;
	if (!userId) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const feedsRes = await db
		.select()
		.from(feeds)
		.where(
			and(
				eq(feeds.userId, userId),
				or(
					lte(feeds.refreshedAt, new Date(Date.now() - 60 * 60 * 1000)), // 1 hour
					isNull(feeds.refreshedAt)
				)
			)
		);

	event.locals.logger.debug(
		{
			count: feedsRes.length
		},
		'Updating feeds'
	);

	if (feedsRes.length === 0) {
		return json({ message: 'No feeds to refresh' });
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
		event.locals.logger.error(
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
			event.locals.logger.error(
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

	await db
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

	return json({ refreshed: parseResults, failedFeeds });
};
