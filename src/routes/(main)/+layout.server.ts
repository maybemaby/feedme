import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { folder } from '$lib/server/db/sqlite-schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const loggedIn = !!event.locals.session;

	if (!loggedIn) {
		throw redirect(303, '/auth/login');
	}

	const folderList = await db
		.select()
		.from(folder)
		.where(eq(folder.userId, event.locals.session!.user.id));

	return {
		loggedIn,
		folderList
	};
};
