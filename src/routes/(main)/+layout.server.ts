import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { feeds, folder } from '$lib/server/db/sqlite-schema';
import { asc, eq, or } from 'drizzle-orm';
import type { FolderTreeNode } from '$lib/components/folder-tree.svelte';
import { inspect } from 'node:util';

export const load: LayoutServerLoad = async (event) => {
	const loggedIn = !!event.locals.session;

	if (!loggedIn) {
		throw redirect(303, '/auth/login');
	}

	const folderList = await db
		.select({
			folder: {
				folderId: folder.id,
				folderName: folder.name,
				folderPath: folder.folderPath,
				parentId: folder.parentId
			},
			feed: {
				id: feeds.id,
				name: feeds.name,
				slug: feeds.slug,
				url: feeds.url
			}
		})
		.from(folder)
		.fullJoin(feeds, eq(feeds.folderId, folder.id))
		.where(
			or(
				eq(folder.userId, event.locals.session!.user.id),
				eq(feeds.userId, event.locals.session!.user.id)
			)
		)
		.orderBy(asc(folder.parentId));

	// console.log(inspect(folderList));

	const folderNodes: Map<number | string, FolderTreeNode> = new Map();

	// ONLY works for 2 level deep folders currently NEEDS FIXING

	for (const { folder, feed } of folderList) {
		if (folder && !feed) {
			if (folder.parentId) {
				const parentFolder = folderNodes.get(folder.parentId);

				if (!parentFolder) {
					throw new Error(`Parent folder not found for ${folder.folderName}`);
				}

				parentFolder.children = parentFolder.children || [];
				parentFolder.children.push({
					id: folder.folderId,
					label: folder.folderName,
					type: 'folder',
					children: []
				});
			} else {
				folderNodes.set(folder.folderId, {
					id: folder.folderId,
					label: folder.folderName,
					type: 'folder',
					children: []
				});
			}
		} else if (!folder && feed) {
			folderNodes.set(feed.id, {
				id: feed.id,
				label: feed.name,
				type: 'item'
			});
		} else if (folder && feed) {
			if (!folderNodes.has(folder.folderId)) {
				folderNodes.set(folder.folderId, {
					id: folder.folderId,
					label: folder.folderName,
					type: 'folder',
					children: []
				});
			}

			if (folder.parentId) {
				const parentFolder = folderNodes.get(folder.parentId);

				if (!parentFolder) {
					throw new Error('Parent folder not found for ' + folder.folderName);
				}

				parentFolder.children = parentFolder.children || [];
				parentFolder.children.push({
					id: folder.folderId,
					label: feed.name,
					type: 'item'
				});
			}
		}
	}

	// console.log(inspect(folderNodes, true, 10));

	const folderTree: FolderTreeNode[] = Array.from(folderNodes.values());

	return {
		loggedIn,
		folderTree
	};
};
