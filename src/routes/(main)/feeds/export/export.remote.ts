import { query, getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db/db';
import { feeds, type SelectFeed } from '$lib/server/db/sqlite-schema';
import { error } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as z from 'zod';

const exportFeedsSchema = z.object({
	feedIds: z.array(z.string()).min(1, 'At least one feed must be selected')
});

export type ExportData = {
	version: string;
	exportDate: string;
	feeds: SelectFeed[];
};

export const exportFeeds = query(exportFeedsSchema, async (data) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	if (data.feedIds.length === 0) {
		throw error(400, 'At least one feed must be selected');
	}

	// Fetch feeds - ensure they belong to the current user
	const selectedFeeds = await getDb()
		.select()
		.from(feeds)
		.where(and(eq(feeds.userId, userId), inArray(feeds.id, data.feedIds)));

	if (selectedFeeds.length === 0) {
		throw error(404, 'No feeds found');
	}

	// Ensure we only export feeds that belong to this user
	if (selectedFeeds.length !== data.feedIds.length) {
		throw error(403, 'Unauthorized: attempted to export feeds that do not belong to you');
	}

	const exportData: ExportData = {
		version: '1.0',
		exportDate: new Date().toISOString(),
		feeds: selectedFeeds
	};

	return exportData;
});
