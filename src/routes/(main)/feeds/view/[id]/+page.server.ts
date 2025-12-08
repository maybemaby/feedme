import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findFeedItemsWithCount } from '$lib/server/feeds-service';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const pageQuery = url.searchParams.get('p');
	const page = pageQuery ? parseInt(pageQuery) : 1;

	const fi = await findFeedItemsWithCount({
		userId,
		feedId: params.id,
		slug: params.id,
		page
	});

	const itemCount = fi[0].totalCount || 0;

	return { feedItems: fi, page, feedId: params.id, itemCount };
};
