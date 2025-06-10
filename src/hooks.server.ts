import { sequence } from '@sveltejs/kit/hooks';
import { defaultLogConfig, vitalHooks } from 'vital-kit/hooks';
import { pino } from 'pino';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';

process.title = 'alternativeframes';

export const betterAuth: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth });
};

export const sessionHandle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = session;

	return resolve(event);
};

const vital = vitalHooks({
	logging: pino({
		...defaultLogConfig,
		transport:
			process.env.NODE_ENV === 'development'
				? {
						target: 'pino-pretty'
					}
				: undefined
	})
});

export const handle = sequence(vital, betterAuth, sessionHandle);
