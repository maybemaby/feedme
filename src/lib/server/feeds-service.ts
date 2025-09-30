import { sql } from 'drizzle-orm';
import { db } from './db';
import { feedItems, type InsertFeedItem } from './db/sqlite-schema';

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
