import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		throw redirect(303, '/');
	}
};
