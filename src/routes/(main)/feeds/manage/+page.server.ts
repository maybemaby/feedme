import { getDb } from '$lib/server/db/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const feedsRes = await getDb().select().from(feeds);

	return {
		feeds: feedsRes
	};
};
