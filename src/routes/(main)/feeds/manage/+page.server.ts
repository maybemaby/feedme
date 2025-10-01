import { db } from '$lib/server/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const feedsRes = await db.select().from(feeds);

	return {
		feeds: feedsRes
	};
};
