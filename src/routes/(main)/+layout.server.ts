import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const loggedIn = !!event.locals.session;

	if (!loggedIn) {
	throw redirect(303, '/auth/login');
	}

	return {
		loggedIn
	};
};
