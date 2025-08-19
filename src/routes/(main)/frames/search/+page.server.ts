import { getFrameSearchParams, searchFrames } from '$lib/server/frames/frames-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const params = getFrameSearchParams(event);

	const frames = searchFrames({
		...params
	});

	let prevPage = null;

	if (params.page > 1) {
		prevPage = params.page - 1;
	}

	return {
		frames,
		prevPage
	};
};
