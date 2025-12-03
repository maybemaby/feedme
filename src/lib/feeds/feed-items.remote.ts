import { form, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import {
	countFeedItemsBuilder,
	feedItemService,
	findFeedItemsBuilder,
	findFeedItemsParamsSchema
} from './queries';
import { getDb } from '$lib/server/db/db';

const getFeedItemsParamSchema = z.object({
	page: z.number().int().positive().optional()
});

export const getFeedItems = query(getFeedItemsParamSchema, async (data) => {
	const event = getRequestEvent();

	const userId = event.locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const [[feedCountRes], feedItemsRes] = await getDb().batch([
		countFeedItemsBuilder({ userId }),
		findFeedItemsBuilder({ userId, page: data.page })
	]);

	return {
		count: feedCountRes.count,
		feedItems: feedItemsRes
	};
});

const readLaterParamSchema = z.object({
	itemId: z.number().int().positive()
});

export const toggleReadLater = form(readLaterParamSchema, async (data) => {
	const event = getRequestEvent();

	const userId = event.locals.session?.user.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	const res = await feedItemService.markReadLater(data.itemId, userId);

	if (res.isErr()) {
		event.locals.logger.error({ error: res.error }, 'Failed to toggle read later');
		throw error(500, 'Failed to toggle read later');
	} else {
		await getFeedItems({ page: 1 }).refresh();

		return {
			message: 'Toggled read later successfully'
		};
	}
});

export const findFeedItems = query(findFeedItemsParamsSchema, async (data) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return await locals.services.feedService.findFeedItems({ ...data, userId });
});

export const countFeedItems = query(
	findFeedItemsParamsSchema.omit({ page: true }),
	async (data) => {
		const { locals } = getRequestEvent();

		const userId = locals.session?.user.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		return await locals.services.feedService.countFeedItems({ ...data, userId });
	}
);
