import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './db';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	logger: process.env.NODE_ENV === 'development' ? console : undefined,
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET!
		}
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
