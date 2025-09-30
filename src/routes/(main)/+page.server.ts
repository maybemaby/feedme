import { db } from '$lib/server/db';
import { feedItems, feeds } from '$lib/server/db/sqlite-schema';
import { desc, eq, getTableColumns } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		return { feeds: [], feedItems: [] };
	}

	const feedRes = await db.select().from(feeds).where(eq(feeds.userId, userId));
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
		.limit(20);

	return { feeds: feedRes, feedItems: feedItemRes };
};
