<script lang="ts">
	import { cn } from '../utils';
	import SearchIcon from '@lucide/svelte/icons/search';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		formWrap = true,
		action,
		placeholder,
		name,
		classname,
		value = $bindable(),
		...rest
	}: {
		formWrap?: boolean;
		action?: string;
		placeholder?: string;
		name?: string;
		classname?: string;
	} & HTMLInputAttributes = $props();
</script>

{#snippet input()}
	<div
		class={cn(
			'flex items-center gap-2',
			'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
			'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
			classname
		)}
	>
		<SearchIcon class="text-muted-foreground size-4" />
		<input type="search" class="w-full border-none outline-none" {placeholder} {name} {...rest} />
	</div>
{/snippet}

{#if formWrap}
	<form {action}>
		{@render input()}
	</form>
{:else}
	{@render input()}
{/if}
