<script lang="ts">
	import type { LayoutProps, PageProps } from './$types';

	let { children, params }: LayoutProps = $props();
</script>

<div class="mx-auto max-w-screen-xl">
	{#if !params.slug}
		<h1 class="my-4 text-2xl">Manage Feeds</h1>
	{/if}

	{@render children?.()}
</div>
