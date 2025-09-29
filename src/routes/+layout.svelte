<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>FeedMe</title>
	<meta name="description" content="Find Alternatives to expensive luxury frames." />
</svelte:head>
{@render children()}
