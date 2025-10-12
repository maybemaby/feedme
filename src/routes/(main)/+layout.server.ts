import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getDb } from '$lib/server/db/db';
import { feeds, folder } from '$lib/server/db/sqlite-schema';
import { asc, eq, or } from 'drizzle-orm';
import type { FolderTreeNode } from '$lib/components/folder-tree.svelte';
import { addChildAtPath } from '$lib/folderTree';

function findRootFolder(
	folderNodes: Map<number | string, FolderTreeNode>,
	parentGraph: Map<number | string, number | string>,
	startingId: number | string
): FolderTreeNode | undefined {
	let currentId: number | string | undefined = startingId;

	while (true) {
		if (!currentId) return;

		const folderNode = folderNodes.get(currentId);

		if (folderNode) {
			return folderNode;
		}

		currentId = parentGraph.get(currentId);
	}
}

export const load: LayoutServerLoad = async (event) => {
	const loggedIn = !!event.locals.session;

	if (!loggedIn) {
		throw redirect(303, '/auth/login');
	}

	const folderList = await getDb()
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
				url: feeds.url,
				folderId: feeds.folderId
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

	const parentMap = new Map<number | string, number | string>();

	const folderNodes: Map<number | string, FolderTreeNode> = new Map();

	for (const { folder, feed } of folderList) {
		if (folder && !feed) {
			if (folder.parentId) {
				parentMap.set(folder.folderId, folder.parentId);

				const rootNode = findRootFolder(folderNodes, parentMap, folder.parentId);

				if (!rootNode) {
					throw new Error(`Parent folder not found for ${folder.folderName}`);
				}

				// Add nested folder to root tree
				addChildAtPath(
					rootNode,
					{
						id: folder.folderId,
						label: folder.folderName,
						type: 'folder',
						children: []
					},
					folder.folderPath
				);
			} else {
				folderNodes.set(folder.folderId, {
					id: folder.folderId,
					label: folder.folderName,
					type: 'folder',
					children: []
				});
			}
		} else if (!folder && feed) {
			// Feed without folder, add to root
			folderNodes.set(feed.id, {
				id: feed.id,
				label: feed.name,
				type: 'item'
			});
		} else if (folder && feed) {
			// Feed with folder
			// Simple folder node check and assign if no parent
			if (!folder.parentId) {
				let folderNode = folderNodes.get(folder.folderId);

				if (!folderNode) {
					folderNode = {
						id: folder.folderId,
						label: folder.folderName,
						type: 'folder',
						children: [
							{
								id: feed.id,
								label: feed.name,
								type: 'item'
							}
						]
					};

					folderNodes.set(folder.folderId, folderNode);
				} else {
					folderNode.children = folderNode.children || [];
					folderNode.children.push({
						id: feed.id,
						label: feed.name,
						type: 'item'
					});
				}
			} else {
				parentMap.set(folder.folderId, folder.parentId);

				const parentFolder = findRootFolder(folderNodes, parentMap, folder.parentId);

				if (!parentFolder) {
					throw new Error(`Parent folder not found for ${folder.folderName}`);
				}

				// Add nested folder to root tree
				addChildAtPath(
					parentFolder,
					{
						id: folder.folderId,
						label: folder.folderName,
						type: 'folder',
						children: [
							{
								id: feed.id,
								label: feed.name,
								type: 'item'
							}
						]
					},
					folder.folderPath
				);
			}
		}
	}

	const folderTree: FolderTreeNode[] = Array.from(folderNodes.values());

	return {
		loggedIn,
		folderTree
	};
};
