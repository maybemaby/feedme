import { command, form, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import z from 'zod';
import { feeds, folder } from './server/db/sqlite-schema';
import { getDb } from './server/db/db';

const addFolderSchema = z.object({
	folderName: z.string().min(1).max(30),
	parentId: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val) : undefined))
});

export type AddFolderRequest = z.infer<typeof addFolderSchema>;

export const addFolder = form(addFolderSchema, async ({ folderName, parentId }) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	let folderPath = folderName;

	if (parentId) {
		const [parentFolder] = await getDb()
			.select()
			.from(folder)
			.where(eq(folder.id, parentId))
			.limit(1)
			.execute();

		if (!parentFolder) {
			throw error(400, 'Parent folder not found');
		}

		folderPath = parentFolder.folderPath + '.' + folderName;
	}

	const [newFolder] = await getDb()
		.insert(folder)
		.values({
			name: folderName,
			folderPath,
			userId,
			parentId: parentId ?? null
		})
		.returning()
		.execute();

	return { newFolder };
});

export const deleteFolder = command(
	z.object({
		folderId: z.string().transform((val) => parseInt(val))
	}),
	async ({ folderId }) => {
		const { locals } = getRequestEvent();

		const userId = locals.session?.user.id;

		if (!userId) {
			throw error(401, 'Unauthorized');
		}

		const subfolders = await getDb().select().from(folder).where(eq(folder.parentId, folderId));

		if (subfolders.length > 0) {
			throw error(400, 'Cannot delete folder with subfolders');
		}

		// Unassign feeds from the folder before deleting
		await getDb().update(feeds).set({ folderId: null }).where(eq(feeds.folderId, folderId));
		await getDb().delete(folder).where(eq(folder.id, folderId));

		return {
			success: true
		};
	}
);

export const getFolders = query(async () => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const folders = await getDb()
		.select()
		.from(folder)
		.where(eq(folder.userId, userId))
		.orderBy(folder.name);

	return { folders };
});

const updateFolderSchema = z.object({
	id: z.coerce.number(),
	name: z.string().min(1).max(255).optional(),
	parentId: z.number().nullable().optional()
});

export type UpdateFolderRequest = z.infer<typeof updateFolderSchema>;

export const updateFolder = command(updateFolderSchema, async (data) => {
	const { locals } = getRequestEvent();

	const userId = locals.session?.user.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const db = getDb();

	await db.update(folder).set(data).where(eq(folder.id, data.id));

	return {
		success: true,
		updatedFolderId: data.id
	};
});
