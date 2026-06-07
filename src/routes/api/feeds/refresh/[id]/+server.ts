import { refreshFeed } from '$lib/server/jobs/refresh-feed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const { id } = event.params;

	const feed = await event.locals.services.feedService.getFeedById(id);

	if (feed.isErr()) {
		event.locals.logger.error({ err: feed.error }, 'Error fetching feed for refresh');
		return new Response(feed.error.message, { status: 500 });
	}

	if (!feed.value) {
		event.locals.logger.warn({ feedId: id }, 'Feed not found for refresh');
		return new Response('Feed not found', { status: 404 });
	}

	const res = await refreshFeed(
		{ id: feed.value.id, url: feed.value.url },
		event.locals.services.feedService,
		event.locals.logger
	);

	if (res.isErr()) {
		event.locals.logger.error({ err: res.error }, 'Error refreshing feed');
		return new Response(res.error.message, { status: 500 });
	}

	return new Response(null, { status: 204 });
};
