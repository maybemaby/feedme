import { getTableColumns, sql, eq, desc, and, count, or } from 'drizzle-orm';
import { db } from './db';
import { feedItems, feeds, type InsertFeedItem } from './db/sqlite-schema';

export async function upsertFeedItems(data: InsertFeedItem[]) {
	return await db
		.insert(feedItems)
		.values(data)
		.onConflictDoUpdate({
			target: [feedItems.url],
			set: {
				publishedAt: sql.raw(`excluded.${feedItems.publishedAt.name}`),
				content: sql.raw(`excluded.${feedItems.content.name}`),
				title: sql.raw(`excluded.${feedItems.title.name}`),
				url: sql.raw(`excluded.${feedItems.url.name}`)
			}
		});
}

interface FindFeedItemsParams {
	feedId?: string;
	userId?: string;
	page?: number;
	slug?: string;
}

export async function findFeedItems(params?: FindFeedItemsParams) {
	return await findFeedItemsBuilder(params);
}

// For use in batched calls
export function findFeedItemsBuilder(params?: FindFeedItemsParams) {
	const page = params?.page || 1;
	return db
		.select({
			...getTableColumns(feedItems),
			feedSlug: feeds.slug,
			feedName: feeds.name
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.where(
			and(
				params?.userId ? eq(feeds.userId, params.userId) : undefined,
				or(
					params?.feedId ? eq(feedItems.feedId, params.feedId) : undefined,
					params?.slug ? eq(feeds.slug, params.slug) : undefined
				)
			)
		)
		.orderBy(desc(feedItems.publishedAt))
		.offset((page - 1) * 20)
		.limit(page * 20);
}

export async function countFeedItems(params: Omit<FindFeedItemsParams, 'page'>) {
	const [feedCount] = await countFeedItemsBuilder(params);

	return feedCount.count;
}

export function countFeedItemsBuilder(params: Omit<FindFeedItemsParams, 'page'>) {
	return db
		.select({
			count: count(feedItems.id)
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.where(
			and(
				params.userId ? eq(feeds.userId, params.userId) : undefined,
				or(
					params.feedId ? eq(feedItems.feedId, params.feedId) : undefined,
					params.slug ? eq(feeds.slug, params.slug) : undefined
				)
			)
		);
}
