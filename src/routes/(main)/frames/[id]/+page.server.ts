import { getAlternativesForFrame, getFrameById } from '$lib/server/frames/frames-service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const id = event.params.id;

	const frame = await getFrameById(Number(id));

	if (!frame) {
		return error(404, `Frame with ID ${id} not found`);
	}

	const alternatives = getAlternativesForFrame(Number(id));

	return {
		frame,
		alternatives
	};
};
