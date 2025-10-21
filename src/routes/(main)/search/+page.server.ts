import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchAllApi } from '$lib/hooks/feed.svelte';

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
	const session = locals.session;

	if (!session) {
		throw redirect(302, '/login');
	}

	const query = url.searchParams.get('query');

	if (!query) {
		return {
			feedItems: [],
			feeds: []
		};
	}

	const res = await searchAllApi(query, {
		fetch
	});

	return res;
};
