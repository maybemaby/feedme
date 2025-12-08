import { getTableColumns, sql, eq, desc, and, count, or } from 'drizzle-orm';
import { getDb } from './db/db';
import { feedItems, feeds, type InsertFeedItem } from './db/sqlite-schema';
import type { FindFeedItemsParams } from '$lib/schema';

export async function upsertFeedItems(data: InsertFeedItem[]) {
	return await getDb()
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

export async function findFeedItemsWithCount(params?: FindFeedItemsParams) {
	const page = params?.page || 1;

	const filterQuery = getDb()
		.$with('filteredFeedItems')
		.as(
			getDb()
				.select({
					...getTableColumns(feedItems),
					feedSlug: feeds.slug,
					feedName: feeds.name,
					feedUrl: feeds.url
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
		);

	const res = await getDb()
		.with(filterQuery)
		.select({
			totalCount: sql<number>`CAST(COUNT(*) OVER () AS INT)`,
			...filterQuery._.selectedFields
		})
		.from(filterQuery)
		.orderBy(desc(filterQuery.publishedAt))
		.limit(20)
		.offset((page - 1) * 20);

	return res;
}

// For use in batched calls
export function findFeedItemsBuilder(params?: FindFeedItemsParams) {
	const page = params?.page || 1;
	return getDb()
		.select({
			...getTableColumns(feedItems),
			feedSlug: feeds.slug,
			feedName: feeds.name,
			feedUrl: feeds.url
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

export function countFeedItemsBuilder(params: Omit<FindFeedItemsParams, 'page'>) {
	return getDb()
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
