import { searchFrames } from '$lib/server/frames/frames-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const brand = event.url.searchParams.get('brand');
	const shape = event.url.searchParams.get('shape');
	const color = event.url.searchParams.get('color');
	const name = event.url.searchParams.get('q') || '';
	const page = Number(event.url.searchParams.get('page')) || 1;

	const frames = searchFrames({
		name,
		brand: brand || undefined,
		shape: shape || undefined,
		page,
		size: 20
	});

	let prevPage = null;

	if (page > 1) {
		prevPage = page - 1;
	}

	return {
		frames,
		prevPage
	};
};
