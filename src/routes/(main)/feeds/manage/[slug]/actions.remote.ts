import { form, getRequestEvent, query } from '$app/server';
import { getDb } from '$lib/server/db/db';
import { feeds } from '$lib/server/db/sqlite-schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as z from 'zod';

export const deleteFeed = form(
	z.object({
		slug: z.string()
	}),
	async ({ slug }) => {
		const { locals } = getRequestEvent();

		const userId = locals.session?.user.id;
		if (!userId) {
			error(401, 'Unauthorized');
		}

		const feed = await getDb()
			.delete(feeds)
			.where(and(eq(feeds.userId, userId), eq(feeds.slug, slug)))
			.returning();

		if (feed.length === 0) {
			throw error(404, 'Feed not found');
		}

		redirect(303, '/feeds/manage');
	}
);

export const loadFeed = query(z.string(), async (slug) => {
	const { locals } = getRequestEvent();

	if (!slug) {
		throw error(400, 'Slug is required');
	}

	const userId = locals.session?.user.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const [feed] = await getDb()
		.select()
		.from(feeds)
		.where(and(eq(feeds.userId, userId), eq(feeds.slug, slug)));

	if (!feed) {
		throw error(404, 'Feed not found');
	}

	return { feed };
});

export const editFeed = form(
	z.object({
		slug: z.string(),
		url: z.url().optional(),
		folderId: z
			.string()
			.optional()
			.transform((val) => (val ? parseInt(val) : undefined))
	}),
	async (data) => {
		const { locals } = getRequestEvent();

		const userId = locals.session?.user.id;
		if (!userId) {
			error(401, 'Unauthorized');
		}

		const feed = await getDb()
			.update(feeds)
			.set({
				url: data.url,
				folderId: data.folderId,
				updatedAt: new Date()
			})
			.where(and(eq(feeds.userId, userId), eq(feeds.slug, data.slug)))
			.returning();

		if (feed.length === 0) {
			throw error(404, 'Feed not found');
		}

		await loadFeed(data.slug).refresh();

		return {
			success: true
		};
	}
);
