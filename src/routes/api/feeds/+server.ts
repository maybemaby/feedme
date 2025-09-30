import { flattenError, z } from 'zod';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getFeedContent, parseFeedContent } from '$lib/server/feeds';
import { db } from '$lib/server/db';
import { feeds, type InsertFeedItem } from '$lib/server/db/sqlite-schema';
import { randomUUID } from 'node:crypto';
import { slugify } from '$lib/utils';
import { upsertFeedItems } from '$lib/server/feeds-service';

const addFeedSchema = z.object({
	url: z.url()
});

export const POST: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const data = await event.request.json();

	const res = await addFeedSchema.safeParseAsync(data);

	if (!res.success) {
		return json({ errors: flattenError(res.error) }, { status: 400 });
	}

	const contentRes = await getFeedContent(res.data.url);

	if (contentRes.isErr()) {
		return json({ message: contentRes.error.message }, { status: 500 });
	}

	const parseRes = parseFeedContent(contentRes.value);

	if (parseRes.isErr()) {
		return json({ message: parseRes.error.message }, { status: 500 });
	}

	const sourceName = parseRes.value[0].sourceName;
	const slug = slugify(sourceName);

	const [insertedFeed] = await db
		.insert(feeds)
		.values({
			createdAt: new Date(),
			updatedAt: new Date(),
			url: res.data.url,
			folderPath: '',
			userId: event.locals.session.user.id,
			id: randomUUID(),
			name: sourceName,
			slug: slug
		})
		.returning({
			id: feeds.id,
			name: feeds.name,
			slug: feeds.slug,
			url: feeds.url,
			folderPath: feeds.folderPath
		});

	const upsertData: InsertFeedItem[] = parseRes.value.map((item) => ({
		url: item.url,
		createdAt: new Date(),
		publishedAt: item.publishedAt || new Date(),
		feedId: insertedFeed.id,
		title: item.title,
		content: item.description ?? ''
	}));

	await upsertFeedItems(upsertData);

	return json({ feed: insertedFeed });
};

export type PostFeedResponse = {
	feed: {
		id: string;
		name: string;
		slug: string;
		url: string;
		folderPath: string;
	};
};
