import z from 'zod';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { validateAction } from 'vital-kit/validation';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { feeds } from '$lib/server/db/sqlite-schema';

export const load: PageServerLoad = async (event) => {
	const userId = event.locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}

	const [feed] = await db
		.select()
		.from(feeds)
		.where(and(eq(feeds.userId, userId), eq(feeds.slug, event.params.slug)));

	return {
		feed
	};
};

const editFeedSchema = z.object({
	url: z.url().optional(),
	folderPath: z.string().optional()
});

export const actions: Actions = {
	async edit({ locals, request, params }) {
		const userId = locals.session?.user.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		const res = await validateAction(editFeedSchema, request);

		if (!res.success) {
			return res.failResponse();
		}

		// Should we check if the feed returns valid content here?
		await db
			.update(feeds)
			.set({
				url: res.value.url,
				folderPath: res.value.folderPath,
				updatedAt: new Date()
			})
			.where(and(eq(feeds.userId, userId), eq(feeds.slug, params.slug)));

		return {
			success: true as const,
			message: 'Feed updated'
		};
	},
	async delete({ locals, params }) {
		const userId = locals.session?.user.id;
		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		const feed = await db
			.delete(feeds)
			.where(and(eq(feeds.userId, userId), eq(feeds.slug, params.slug)))
			.returning();

		if (feed.length === 0) {
			throw error(404, 'Feed not found');
		}

		throw redirect(303, '/feeds/manage');
	}
};
