import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFrameById } from '$lib/server/frames/frames-service';

export const load: PageServerLoad = async (event) => {
	const forId = event.url.searchParams.get('forId');

	if (!forId) {
		return error(400, 'Missing forId parameter');
	}

	const frameId = Number(forId);

	const frame = await getFrameById(frameId);

	if (!frame) {
		return error(404, `Frame with ID ${frameId} not found`);
	}

	return {
		frame
	};
};
