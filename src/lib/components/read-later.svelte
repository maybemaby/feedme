<script lang="ts">
	import { toggleReadLater } from '$lib/feeds/feed-items.remote';
	import { Button } from './ui/button';
	import BookMark from '@lucide/svelte/icons/bookmark';
	import X from '@lucide/svelte/icons/bookmark-x';

	let {
		itemId,
		isMarked = false
	}: {
		itemId: number;
		isMarked?: boolean;
	} = $props();

	let marked = $derived(isMarked);

	let msg = $derived.by(() => (marked ? 'Remove' : 'Read Later'));
</script>

<form
	{...toggleReadLater.for(itemId).enhance(async ({ submit }) => {
		marked = !marked;

		try {
			await submit();
		} catch (e) {
			console.error('Failed to submit form', e);
			marked = !marked;
		}
	})}
>
	<input {...toggleReadLater.fields.itemId.as('number')} type="hidden" value={itemId} />
	<Button type="submit" size="sm" variant="ghost">
		{#if marked}
			<X />
		{:else}
			<BookMark />
		{/if}

		{msg}
	</Button>
</form>
