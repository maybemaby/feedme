import { getContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';

export class FolderTreeState {
	openFolders = new SvelteSet<string>();

	toggleFolder(folderPath: string) {
		if (this.openFolders.has(folderPath)) {
			this.openFolders.delete(folderPath);
		} else {
			this.openFolders.add(folderPath);
		}
	}
}

export const folderTreeStateKey = 'folderTreeState' as const;

export const getFolderTreeState = () => {
	return getContext<FolderTreeState>(folderTreeStateKey);
};
