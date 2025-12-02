import { form, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { feedItemService } from './queries';

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
