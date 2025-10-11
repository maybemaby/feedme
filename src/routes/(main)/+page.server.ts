import { db } from '$lib/server/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { countFeedItems, findFeedItems } from '$lib/server/feeds-service';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/login');
	}
	const pageQuery = url.searchParams.get('p');

	const page = pageQuery ? parseInt(pageQuery) : 1;

	const feedRes = await db.select().from(feeds).where(eq(feeds.userId, userId));

	const feedCount = await countFeedItems({ userId });

	const feedItemRes = await findFeedItems({
		userId,
		page
	});

	return { feeds: feedRes, feedItems: feedItemRes, page, feedCount };
};
