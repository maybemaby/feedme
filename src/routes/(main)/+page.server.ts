import { db } from '$lib/server/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		return { feeds: [] };
	}

	const feedRes = await db.select().from(feeds).where(eq(feeds.userId, userId));

	return { feeds: feedRes };
};
