import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db/db';
import { folder } from '$lib/server/db/sqlite-schema';
import type { RequestHandler } from './$types';
import * as z from 'zod';
import { eq } from 'drizzle-orm';

const addFolderSchema = z.object({
	name: z.string().min(1).max(30),
	parentId: z.int().nullable().optional()
});

export type AddFolderRequest = z.infer<typeof addFolderSchema>;

export const POST: RequestHandler = async ({ locals, request }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.json();

	const parseRes = addFolderSchema.safeParse(data);

	if (!parseRes.success) {
		return new Response('Invalid folder name', { status: 400 });
	}

	let folderPath = parseRes.data.name;

	if (parseRes.data.parentId) {
		const [parentFolder] = await getDb()
			.select()
			.from(folder)
			.where(eq(folder.id, parseRes.data.parentId))
			.limit(1)
			.execute();

		if (!parentFolder) {
			return new Response('Parent folder not found', { status: 400 });
		}

		folderPath = parentFolder.folderPath + '.' + parseRes.data.name;
	}

	const [newFolder] = await getDb()
		.insert(folder)
		.values({
			name: parseRes.data.name,
			userId,
			folderPath,
			parentId: parseRes.data.parentId || null
		})
		.returning();

	return json(newFolder, { status: 201 });
};

export const GET: RequestHandler = async ({ locals }) => {
	const userId = locals.session?.user.id;

	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	const folders = await getDb()
		.select()
		.from(folder)
		.where(eq(folder.userId, userId))
		.orderBy(folder.name);

	return json({ folders });
};
