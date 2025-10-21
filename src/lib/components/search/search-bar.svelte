<script lang="ts">
	import { cn } from '$lib/utils';
	import { Search } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import { type HTMLInputAttributes } from 'svelte/elements';
	import { type SearchContext, searchContextKey } from './root.svelte';

	let {
		class: className,
		value = $bindable(),
		name,
		...rest
	}: { class?: string; value?: string; name?: string } & HTMLInputAttributes = $props();

	const ctx = getContext<SearchContext>(searchContextKey);
</script>

<div
	class={cn(
		'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
		'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
		'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
		'flex items-center gap-2',
		'search-bar',
		className
	)}
>
	<Search size={14} color="currentColor" />
	<input
		autocomplete="off"
		type="search"
		class="w-full bg-transparent outline-none"
		placeholder="Search..."
		bind:value
		{name}
		{...rest}
	/>
</div>
