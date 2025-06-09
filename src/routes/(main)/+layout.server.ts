import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	return {
		loggedIn: !!event.locals.session
	};
};
