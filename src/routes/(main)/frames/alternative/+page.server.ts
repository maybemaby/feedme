import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFrameById, searchFramesAll } from '$lib/server/frames/frames-service';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		return error(401, 'Unauthorized');
	}

	const forId = event.url.searchParams.get('forId');
	const query = event.url.searchParams.get('q');

	if (!forId) {
		return error(400, 'Missing forId parameter');
	}

	const frameId = Number(forId);

	const frame = await getFrameById(frameId);

	if (!frame) {
		return error(404, `Frame with ID ${frameId} not found`);
	}

	let searchedFrames: ReturnType<typeof searchFramesAll> | null = null;

	if (query) {
		searchedFrames = searchFramesAll({
			name: query
		});
	}

	return {
		frame,
		searchedFrames
	};
};

import type { Actions } from './$types';

export const actions: Actions = {
	async default({ request, locals }) {
		if (!locals.session) {
			return error(401, 'unauthorized');
		}
		

		const formData = await request.formData();

		const frameId = formData.get('frameId');
		const forId = formData.get('forId');

		if (!frameId || typeof frameId !== 'string') {
			return error(400, 'Invalid frameId');
		}


	}
};
