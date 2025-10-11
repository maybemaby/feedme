<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';

	let { children }: LayoutProps = $props();
</script>

<div class="mx-auto max-w-screen-xl">
	{#if !page.params.slug}
		<h1 class="my-4 text-2xl">Manage Feeds</h1>
	{/if}

	{@render children?.()}
</div>
