<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Alternative Frames</title>
	<meta name="description" content="Find Alternatives to expensive luxury frames." />
</svelte:head>
{@render children()}
