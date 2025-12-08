import { command, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { countFeedItemsBuilder, findFeedItemsBuilder } from './queries';
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
	itemId: z.number().int().positive(),
	readLater: z.boolean()
});

export const toggleReadLater = command(readLaterParamSchema, async (data) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	const res = await locals.services.feedItemService.markReadLater(
		data.itemId,
		userId,
		data.readLater
	);

	if (res.isErr()) {
		locals.logger.error({ error: res.error }, 'Failed to toggle read later');
		throw error(500, 'Failed to toggle read later');
	} else {
		locals.logger.debug(
			`Toggled read later for item ${data.itemId} to ${res.value} for user ${userId}`
		);

		getReadLaterStatus(data.itemId).set(res.value);

		return {
			message: 'Toggled read later successfully',
			isMarked: res.value
		};
	}
});

export const getReadLaterStatus = query.batch(z.number().int().positive(), async (ids) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	const res = await locals.services.feedItemService.getReadLaterStatus(ids, userId);

	if (res.isErr()) {
		locals.logger.error({ error: res.error }, 'Failed to get read later status');
		error(500, 'Failed to get read later status');
	}

	return (id: number) => res.value[id];
});

export const getReadLaterItems = query(async () => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		error(401, 'Unauthorized');
	}

	return locals.services.feedItemService.getReadLaterItems(userId);
});
