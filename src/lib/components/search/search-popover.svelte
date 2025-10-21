<script lang="ts">
	import { Popover } from 'bits-ui';
	import { getContext, type Snippet } from 'svelte';

	import { type SearchContext, searchContextKey } from './root.svelte';

	let { children }: { children?: Snippet } = $props();

	const ctx = getContext<SearchContext>(searchContextKey);
</script>

<Popover.Portal>
	<Popover.Portal>
		<Popover.Content
			align="end"
			sideOffset={8}
			customAnchor={ctx().anchorRef}
			class="bg-popover border-foreground z-10 w-[300px] border p-4"
			trapFocus={false}
			onOpenAutoFocus={(e) => e.preventDefault()}
			onCloseAutoFocus={(e) => e.preventDefault()}
		>
			{@render children?.()}
		</Popover.Content>
	</Popover.Portal>
</Popover.Portal>
