<script module lang="ts">
	export const searchContextKey = Symbol('searchContext');
	export type SearchContext = () => {
		anchorRef?: HTMLElement | null;
	};
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { Popover } from 'bits-ui';

	let popoverAnchor = $state<HTMLElement | null>(null);

	setContext(searchContextKey, () => ({
		anchorRef: popoverAnchor
	}));

	let {
		children,
		onsubmit,
		popoverOpen = $bindable(false),
		formAction
	}: {
		children: Snippet;
		onsubmit?: (event: Event) => void;
		popoverOpen?: boolean;
		formAction?: string;
	} = $props();
</script>

<Popover.Root bind:open={popoverOpen}>
	<form {onsubmit} bind:this={popoverAnchor} action={formAction}>
		{#if children}
			{@render children()}
		{/if}
	</form>
</Popover.Root>
