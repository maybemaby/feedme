<script lang="ts">
	import { untrack } from 'svelte';
	import { Button } from './ui/button';
	import BookMark from '@lucide/svelte/icons/bookmark';
	import X from '@lucide/svelte/icons/bookmark-x';
	import { Debounced } from 'runed';

	let {
		itemId,
		isMarked = false,
		onToggle
	}: {
		itemId: number;
		isMarked?: boolean;
		onToggle?: (itemId: number, readLater: boolean) => void;
	} = $props();

	let changedOnce = $state(false);
	let marked = $state(isMarked);
	let markedDebounced = new Debounced(() => marked, 300);

	let msg = $derived.by(() => (marked ? 'Remove' : 'Read Later'));

	const handleToggle = () => {
		changedOnce = true;
		marked = !marked;
	};

	$effect(() => {
		(() => markedDebounced.current)();

		untrack(() => {
			if (!changedOnce) return;
			if (onToggle) {
				onToggle(itemId, markedDebounced.current);
			}
		});
	});
</script>

<Button type="button" size="sm" variant="ghost" onclick={handleToggle} aria-pressed={marked}>
	{#if marked}
		<X />
		<span class="sr-only">Remove from Read Later</span>
	{:else}
		<BookMark />
		<span class="sr-only">Add to Read Later</span>
	{/if}

	{msg}
</Button>
