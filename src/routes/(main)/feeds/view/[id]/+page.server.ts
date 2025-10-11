import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { countFeedItems, findFeedItems } from '$lib/server/feeds-service';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const pageQuery = url.searchParams.get('p');
	const page = pageQuery ? parseInt(pageQuery) : 1;

	const feedItems = await findFeedItems({
		userId,
		feedId: params.id,
		page
	});

	const itemCount = countFeedItems({
		userId,
		feedId: params.id
	});

	return { feedItems, page, feedId: params.id, itemCount };
};
