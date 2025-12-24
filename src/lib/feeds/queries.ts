import { ResultAsync } from 'neverthrow';
import { LibsqlError, type ResultSet } from '@libsql/client';
import { DbError } from '../server/db/errors';
import { getDb } from '../server/db/db';
import {
	feedItems,
	feeds,
	readLater,
	type InsertFeedItem,
	type FeedItem,
	type SelectFeed
import { and, count, desc, eq, getTableColumns, inArray, like, or, sql } from 'drizzle-orm';
import { and, count, desc, eq, getTableColumns, inArray, or, sql } from 'drizzle-orm';
import type { FindFeedItemsParams } from '$lib/schema';

type ReadLaterItem = FeedItem & {
	feedName: string;
	feedSlug: string;
};

export interface FeedItemService {
	readonly markReadLater: (
		itemId: number,
		userId: string,
		readLater: boolean
	) => ResultAsync<boolean, DbError>;
	readonly getReadLaterStatus: (
		itemIds: number[],
		userId: string
	) => ResultAsync<Record<number, boolean>, DbError>;
	getReadLaterItems: (userId: string) => Promise<ReadLaterItem[]>;
	readonly searchResources: (
		query: string,
		userId: string
	) => ResultAsync<
		{
			feedItems: FeedItem[];
			feeds: SelectFeed[];
		},
		DbError
	>;
}

export const feedItemService: FeedItemService = {
	markReadLater: function (
		itemId: number,
		userId: string,
		markAsReadLater: boolean
	): ResultAsync<boolean, DbError> {
		return ResultAsync.fromPromise(
			(async () => {
				const db = getDb();
				const [exisitingMark] = await db
					.select()
					.from(readLater)
					.where(and(eq(readLater.itemId, itemId), eq(readLater.userId, userId)))
					.limit(1);

				if (!exisitingMark && markAsReadLater) {
					await db.insert(readLater).values({ itemId, userId });

					return true;
				} else if (exisitingMark && !markAsReadLater) {
					await db
						.delete(readLater)
						.where(and(eq(readLater.itemId, itemId), eq(readLater.userId, userId)));
					return false;
				} else {
					return markAsReadLater;
				}
			})(),
			(e) => {
				if (e instanceof LibsqlError) {
					return new DbError('Failed to update read later', { originalError: e, code: e.code });
				}
				return new DbError('Failed to update read later', { originalError: e });
			}
		);
	},
	getReadLaterStatus: function (
		itemIds: number[],
		userId: string
	): ResultAsync<Record<number, boolean>, DbError> {
		return ResultAsync.fromPromise(
			(async () => {
				const readLaters = await getDb()
					.select()
					.from(readLater)
					.where(and(inArray(readLater.itemId, itemIds), eq(readLater.userId, userId)));

				const statusMap: Record<number, boolean> = {};

				for (const id of itemIds) {
					statusMap[id] = false;
				}

				for (const readLater of readLaters) {
					statusMap[readLater.itemId] = true;
				}

				return statusMap;
			})(),
			(e) => new DbError('Failed to get read later status', { originalError: e })
		);
	},
	getReadLaterItems: function (userId: string): Promise<ReadLaterItem[]> {
		return getDb()
			.select({ ...getTableColumns(feedItems), feedName: feeds.name, feedSlug: feeds.slug })
			.from(feedItems)
			.innerJoin(readLater, eq(readLater.itemId, feedItems.id))
			.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
			.where(eq(readLater.userId, userId))
			.orderBy(desc(readLater.addedAt));
	},
	searchResources(query, userId) {
		return ResultAsync.fromPromise(
			(async () => {
				const db = getDb();

				const items = await db
					.select(getTableColumns(feedItems))
					.from(feedItems)
					.leftJoin(feeds, eq(feedItems.feedId, feeds.id))
					.where(and(eq(feeds.userId, userId), like(sql`lower(${feedItems.title})`, `%${query}%`)));

				const feedsRes = await db
					.select()
					.from(feeds)
					.where(and(eq(feeds.userId, userId), like(sql`lower(${feeds.name})`, `%${query}%`)));

				return {
					feedItems: items,
					feeds: feedsRes
				};
			})(),
			(e) => new DbError('Failed to search feed resources', { originalError: e })
		);
	}
};

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
	readLater: number | null;
}

export interface FeedService {
	readonly upsertFeedItems: (data: InsertFeedItem[]) => Promise<ResultSet>;
	readonly findFeedItemsWithCount: (params?: FindFeedItemsParams) => Promise<FeedItemsWithCount[]>;
}

export const feedService: FeedService = {
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
						feedUrl: feeds.url,
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
