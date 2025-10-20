import { getDb } from '$lib/server/db/db';
import { feeds, folder } from '$lib/server/db/sqlite-schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = locals.session;

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const folderId = parseInt(params.id);

	if (isNaN(folderId)) {
		return new Response('Invalid folder ID', { status: 400 });
	}

	const db = getDb();

	const subFolders = await db.select().from(folder).where(eq(folder.parentId, folderId));

	if (subFolders.length > 0) {
		return new Response('Cannot delete folder with subfolders', { status: 400 });
	}

	// Unassign feeds from the folder before deleting
	await db.update(feeds).set({ folderId: null }).where(eq(feeds.folderId, folderId));

	await db.delete(folder).where(eq(folder.id, folderId));

	return new Response(null, { status: 204 });
};
