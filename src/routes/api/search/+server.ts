import { getDb } from '$lib/server/db/db';
import { feedItems, feeds, type FeedItem, type SelectFeed } from '$lib/server/db/sqlite-schema';
import { json, type RequestHandler } from '@sveltejs/kit';
import { and, eq, getTableColumns, like, sql } from 'drizzle-orm';

// Search all feeds and items
export const GET: RequestHandler = async ({ locals, url }) => {
	const session = locals.session;

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const query = (url.searchParams.get('q') || '').toLowerCase();

	const db = getDb();

	const items = await db
		.select(getTableColumns(feedItems))
		.from(feedItems)
		.leftJoin(feeds, eq(feedItems.feedId, feeds.id))
		.where(
			and(eq(feeds.userId, session.user.id), like(sql`lower(${feedItems.title})`, `%${query}%`))
		);

	const feedRes = await db
		.select()
		.from(feeds)
		.where(and(eq(feeds.userId, session.user.id), like(sql`lower(${feeds.name})`, `%${query}%`)));

	return json({
		feedItems: items,
		feeds: feedRes
	});
};

export type SearchResponse = {
	feedItems: FeedItem[];
	feeds: SelectFeed[];
};
