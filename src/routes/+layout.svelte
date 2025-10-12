<script lang="ts">
	import { FolderTreeState, folderTreeStateKey } from '$lib/state/folderTree.svelte';
	import { setContext } from 'svelte';
	import '../app.css';

	let { children } = $props();

	const foldersState = new FolderTreeState();

	setContext(folderTreeStateKey, foldersState);
</script>

<svelte:head>
	<title>FeedMe</title>
	<meta name="description" content="Find Alternatives to expensive luxury frames." />
</svelte:head>
{@render children()}
