import { ResultAsync } from 'neverthrow';
import { LibsqlError, type ResultSet } from '@libsql/client';
import { DbError } from '../server/db/errors';
import { getDb } from '../server/db/db';
import { feedItems, feeds, readLater, type InsertFeedItem } from '../server/db/sqlite-schema';
import { and, count, desc, eq, getTableColumns, isNull, or, sql } from 'drizzle-orm';
import type { FindFeedItemsParams } from '$lib/schema';

export interface FeedItemService {
	readonly markReadLater: (itemId: number, userId: string) => ResultAsync<void, DbError>;
}

export const feedItemService: FeedItemService = {
	markReadLater: function (itemId: number, userId: string): ResultAsync<void, DbError> {
		return ResultAsync.fromPromise(
			(async () => {
				const db = getDb();
				const [exisitingMark] = await db
					.select()
					.from(readLater)
					.where(and(eq(readLater.itemId, itemId), eq(readLater.userId, userId)))
					.limit(1);

				if (!exisitingMark) {
					await db.insert(readLater).values({ itemId, userId });
				} else {
					await db
						.delete(readLater)
						.where(and(eq(readLater.itemId, itemId), eq(readLater.userId, userId)));
				}
			})(),
			(e) => {
				if (e instanceof LibsqlError) {
					return new DbError('Failed to update read later', { originalError: e, code: e.code });
				}
				return new DbError('Failed to update read later', { originalError: e });
			}
		);
	}
};

interface FeedItemsResults {
	id: number;
	feedId: string;
	title: string;
	url: string;
	content: string;
	publishedAt: Date;
	createdAt: Date;
	feedSlug: string;
	feedName: string;
	readLater: number | null;
}

interface FeedItemsWithCount {
	feedSlug: string;
	feedName: string;
	feedUrl: string;
	id: number;
	feedId: string;
	title: string;
	url: string;
	content: string;
	publishedAt: Date;
	createdAt: Date;
	totalCount: number;
}

export interface FeedService {
	readonly findFeedItems: (params?: FindFeedItemsParams) => Promise<FeedItemsResults[]>;
	readonly countFeedItems: (
		params: Omit<FindFeedItemsParams, 'page'>
	) => Promise<{ count: number }>;
	readonly upsertFeedItems: (data: InsertFeedItem[]) => Promise<ResultSet>;
	readonly findFeedItemsWithCount: (params?: FindFeedItemsParams) => Promise<FeedItemsWithCount[]>;
}

export const feedService: FeedService = {
	findFeedItems: function (params?: FindFeedItemsParams): Promise<FeedItemsResults[]> {
		return findFeedItemsBuilder(params);
	},
	countFeedItems: async function (
		params: Omit<FindFeedItemsParams, 'page'>
	): Promise<{ count: number }> {
		const [feedCount] = await countFeedItemsBuilder(params);
		return feedCount;
	},
	upsertFeedItems: function (data: InsertFeedItem[]): Promise<ResultSet> {
		return getDb()
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
	},
	async findFeedItemsWithCount(params?: FindFeedItemsParams) {
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
};

// For use in batched calls
export function findFeedItemsBuilder(params?: FindFeedItemsParams) {
	const page = params?.page || 1;
	return getDb()
		.select({
			...getTableColumns(feedItems),
			feedSlug: feeds.slug,
			feedName: feeds.name,
			readLater: readLater.id
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.leftJoin(readLater, eq(readLater.itemId, feedItems.id))
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
		.limit(20);
}

export function countFeedItemsBuilder(params: Omit<FindFeedItemsParams, 'page'>) {
	return getDb()
		.select({
			count: count(feedItems.id)
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.leftJoin(readLater, eq(readLater.itemId, feedItems.id))
		.where(
			and(
				params.userId ? eq(feeds.userId, params.userId) : undefined,
				or(
					params?.feedId ? eq(feedItems.feedId, params.feedId) : undefined,
					params?.slug ? eq(feeds.slug, params.slug) : undefined
				)
			)
		);
}
