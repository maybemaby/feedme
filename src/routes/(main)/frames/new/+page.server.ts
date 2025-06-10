import { validateAction } from 'vital-kit/validation';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { brands, insertFrameSchema } from '$lib/server/db/schema';
import {
	addAlternative,
	createFrame,
	createRequest,
	getFrameById
} from '$lib/server/frames/frames-service';
import { db } from '$lib/server/db';
import { z } from 'zod/v4';

const newFrameSchema = insertFrameSchema.extend({
	alternateFor: z.coerce.number().int().optional()
});

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session) {
		return redirect(303, '/auth/login');
	}

	const foundBrands = await db.select().from(brands).orderBy(brands.name);

	return {
		brands: foundBrands
	};
};

export const actions: Actions = {
	async default({ request, locals }) {
		if (!locals.session) {
			return error(401, 'Unauthorized');
		}

		const userId = locals.session.user.id;

		const res = await validateAction(newFrameSchema, request);

		if (!res.success) {
			return res.failResponse();
		}

		if (res.value.alternateFor) {
			// Check if the alternate frame exists

			const originalFrame = await getFrameById(res.value.alternateFor);

			if (!originalFrame) {
				return fail(400, {
					success: false as const,
					fields: {}
				});
			}
		}

		const id = await db.transaction(async (tx) => {
			const id = await createFrame({ ...res.value, userId }, tx);

			if (res.value.alternateFor) {
				await addAlternative(res.value.alternateFor, id, tx);
			} else {
				await createRequest(id, userId);
			}

			return id;
		});

		return {
			success: true,
			id
		};
	}
};
