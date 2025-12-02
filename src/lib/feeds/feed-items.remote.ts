import { form, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { countFeedItemsBuilder, feedItemService, findFeedItemsBuilder } from './queries';
import { getDb } from '$lib/server/db/db';

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
		return {
			message: 'Toggled read later successfully'
		};
	}
});

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

	event.locals.logger.debug(
		{
			count: feedCountRes.count,
			res: feedItemsRes.map((r) => ({
				id: r.id,
				title: r.title,
				published: r.publishedAt,
				readLater: r.readLater
			}))
		},
		'Fetched feed items'
	);

	return {
		count: feedCountRes.count,
		feedItems: feedItemsRes
	};
});
