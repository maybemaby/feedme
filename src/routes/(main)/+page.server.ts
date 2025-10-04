import { db } from '$lib/server/db';
import { feedItems, feeds } from '$lib/server/db/sqlite-schema';
import { count, desc, eq, getTableColumns } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/login');
	}
	const pageQuery = url.searchParams.get('p');

	const page = pageQuery ? parseInt(pageQuery) : 1;

	const feedRes = await db.select().from(feeds).where(eq(feeds.userId, userId));

	const [feedCount] = await db
		.select({
			count: count(feedItems.id)
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.where(eq(feeds.userId, userId));

	const feedItemRes = await db
		.select({
			...getTableColumns(feedItems),
			feedSlug: feeds.slug,
			feedName: feeds.name
		})
		.from(feedItems)
		.innerJoin(feeds, eq(feedItems.feedId, feeds.id))
		.where(eq(feeds.userId, userId))
		.orderBy(desc(feedItems.publishedAt))
		.offset((page - 1) * 20)
		.limit(page * 20);

	return { feeds: feedRes, feedItems: feedItemRes, page, feedCount: feedCount.count };
};
