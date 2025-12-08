<script lang="ts">
	import { toggleReadLater } from '$lib/feeds/feed-items.remote';
	import {  untrack } from 'svelte';
	import { Button } from './ui/button';
	import BookMark from '@lucide/svelte/icons/bookmark';
	import X from '@lucide/svelte/icons/bookmark-x';
	import { Debounced } from 'runed';

	let {
		itemId,
		isMarked = false
	}: {
		itemId: number;
		isMarked?: boolean;
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
			toggleReadLater({ itemId, readLater: markedDebounced.current }).then();
		});
	});
</script>

<Button type="button" size="sm" variant="ghost" onclick={handleToggle}>
	{#if marked}
		<X />
	{:else}
		<BookMark />
	{/if}

	{msg}
</Button>
