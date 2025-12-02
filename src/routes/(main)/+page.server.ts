import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/login');
	}
};
