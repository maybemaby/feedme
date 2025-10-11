import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { countFeedItemsBuilder, findFeedItemsBuilder } from '$lib/server/feeds-service';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/login');
	}
	const pageQuery = url.searchParams.get('p');

	const page = pageQuery ? parseInt(pageQuery) : 1;

	// const feedCount = await countFeedItems({ userId });

	// const feedItemRes = await findFeedItems({
	// 	userId,
	// 	page
	// });
	// return { feedItems: feedItemRes, page, feedCount };

	const [[feedCountRes], feedItemsRes] = await db.batch([
		countFeedItemsBuilder({ userId }),
		findFeedItemsBuilder({ userId, page })
	]);

	return { feedItems: feedItemsRes, page, feedCount: feedCountRes.count };
};
