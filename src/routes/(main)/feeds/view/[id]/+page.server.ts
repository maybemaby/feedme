import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const pageQuery = url.searchParams.get('p');
	const page = pageQuery ? parseInt(pageQuery) : 1;

	// Allow usage of either feed ID or slug in the URL
	const feedItems = await locals.services.feedService.findFeedItems({
		userId,
		feedId: params.id,
		slug: params.id,
		page
	});

	const itemCount = locals.services.feedService.countFeedItems({
		userId,
		feedId: params.id
	});

	return { feedItems, page, feedId: params.id, itemCount };
};
