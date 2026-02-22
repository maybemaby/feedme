import { query, form, getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db/db';
import { feeds, type SelectFeed } from '$lib/server/db/sqlite-schema';
import { error } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import * as z from 'zod';
import { randomUUID } from 'crypto';

const exportFeedsSchema = z.object({
	feedIds: z.array(z.string()).min(1, 'At least one feed must be selected')
});

const importFeedsSchema = z.object({
	importFile: z.file().max(5 * 1024 * 1024) // 5MB limit
});

export type ExportData = {
	version: string;
	exportDate: string;
	feeds: SelectFeed[];
};

export type ImportResult = {
	imported: number;
	skipped: number;
	errors: string[];
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

export const importFeeds = form(importFeedsSchema, async (data) => {
	const { locals } = getRequestEvent();
	const logger = locals.logger;

	const userId = locals.session?.user.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const fileContent = await data.importFile.text();

	let parsedData: ExportData;

	try {
		parsedData = JSON.parse(fileContent);
	} catch (e: unknown) {
		throw error(400, 'Invalid JSON file format');
	}

	// Validate the structure
	if (!parsedData.version || !parsedData.feeds || !Array.isArray(parsedData.feeds)) {
		throw error(400, 'Invalid export file format - missing required fields');
	}

	// Import feeds, silently skipping duplicates (by URL)
	const result: ImportResult = {
		imported: 0,
		skipped: 0,
		errors: []
	};

	const db = getDb();

	for (const feedToImport of parsedData.feeds) {
		try {
			// Check if feed with same URL already exists for this user
			const existingFeed = await db
				.select()
				.from(feeds)
				.where(and(eq(feeds.userId, userId), eq(feeds.url, feedToImport.url)))
				.limit(1);

			if (existingFeed.length > 0) {
				// Silently skip duplicate
				result.skipped++;
				continue;
			}

			// Insert new feed (flattened to root - no folderId)
			await db.insert(feeds).values({
				id: randomUUID(),
				userId: userId,
				url: feedToImport.url,
				name: feedToImport.name,
				slug: feedToImport.slug,
				createdAt: new Date(),
				updatedAt: new Date()
				// folderId intentionally left as null (root level)
			});

			result.imported++;
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Unknown error';
			result.errors.push(`Failed to import "${feedToImport.name}": ${errorMsg}`);
		}
	}

	return result;
});
