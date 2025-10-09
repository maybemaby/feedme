import { refreshFeed } from '$lib/server/jobs/refresh-feed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const { id } = event.params;

	const res = await refreshFeed(id, event.locals.logger);

	if (res.isErr()) {
		return new Response(res.error.message, { status: 500 });
	}

	return new Response(null, { status: 204 });
};
