<script lang="ts">
	import { FolderTreeState, folderTreeStateKey } from '$lib/state/folderTree.svelte';
	import { setContext } from 'svelte';
	import '../app.css';

	const ToasterModule = import('$lib/components/ui/sonner/index');

	let { children } = $props();

	const foldersState = new FolderTreeState();

	setContext(folderTreeStateKey, foldersState);
</script>

<svelte:head>
	<title>FeedMe</title>
	<meta name="description" content="Find Alternatives to expensive luxury frames." />
</svelte:head>
{@render children()}

{#await ToasterModule then { Toaster }}
	<Toaster richColors />
{/await}
