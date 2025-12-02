import type { auth } from '$lib/server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: typeof auth.$Infer.Session | null;
			logger: import('pino').Logger;
			reqId: string;
			services: {
				feedItemService: import('$lib/feeds/queries').FeedItemService;
				feedService: import('$lib/feeds/queries').FeedService;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
