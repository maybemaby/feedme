import { form, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import * as z from 'zod';
import { getFeedContent, parseFeedContent } from '../server/feeds';
import { slugify } from '../utils';
import { randomUUID } from 'crypto';
import { getDb } from '../server/db/db';
import { eq } from 'drizzle-orm';
import { feeds, type InsertFeedItem } from '../server/db/sqlite-schema';
import { findFeedItemsSchema } from '$lib/schema';

const addFeedSchema = z.object({
	url: z.url()
});

export const addFeed = form(addFeedSchema, async ({ url }) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const contentRes = await getFeedContent(url);

	if (contentRes.isErr()) {
		throw error(500, contentRes.error.message);
	}

	const parseRes = parseFeedContent(contentRes.value);

	if (parseRes.isErr()) {
		throw error(500, parseRes.error.message);
	}

	const sourceName = parseRes.value[0].sourceName;
	const slug = slugify(sourceName);

	const [insertedFeed] = await getDb()
		.insert(feeds)
		.values({
			createdAt: new Date(),
			updatedAt: new Date(),
			url: url,
			userId: userId,
			id: randomUUID(),
			name: sourceName,
			slug: slug
		})
		.returning({
			id: feeds.id,
			name: feeds.name,
			slug: feeds.slug,
			url: feeds.url,
			folderId: feeds.folderId
		});

	const upsertData: InsertFeedItem[] = parseRes.value.map((item) => ({
		url: item.url,
		createdAt: new Date(),
		publishedAt: item.publishedAt || new Date(),
		feedId: insertedFeed.id,
		title: item.title,
		content: item.description ?? ''
	}));

	await locals.services.feedService.upsertFeedItems(upsertData);

	return {
		feed: insertedFeed
	};
});

export const findFeedItemsWithCount = query(
	findFeedItemsSchema.omit({
		userId: true
	}),
	async (params) => {
		const { locals } = getRequestEvent();

		const userId = locals.session?.user.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		return await locals.services.feedService.findFeedItemsWithCount({ ...params, userId });
	}
);

export const searchAllResources = query(z.string(), async (queryStr) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const query = queryStr.toLowerCase();

	const res = await locals.services.feedItemService.searchResources(query, userId);

	if (res.isErr()) {
		locals.logger.error({ error: res.error }, 'Failed to search feed resources');
		throw error(500, 'Internal server error');
	}

	return res.value;
});

export const getUserFeeds = query(z.void(), async () => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const feedsList = await getDb().select().from(feeds).where(eq(feeds.userId, userId));

	return feedsList;
});
