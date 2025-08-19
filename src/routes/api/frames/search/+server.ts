import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFrameSearchParams, searchFramesAll } from '$lib/server/frames/frames-service';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.session) {
		error(401, 'Unauthorized');
	}

	const params = getFrameSearchParams(event);

	const frames = await searchFramesAll(params);

	return json({ frames });
};
