<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cn } from '../utils';
	import type { FormFieldErrors } from '../hooks/forms.svelte';
	import type { RemoteFormIssue } from '@sveltejs/kit';

	let {
		classname,
		hint,
		errors,
		field,
		children
	}: {
		classname?: ClassValue;
		hint?: string;
		errors?: FormFieldErrors | RemoteFormIssue[];
		field?: string;
		children: Snippet;
	} = $props();

	let error = $derived.by(() => {
		if (Array.isArray(errors)) {
			return errors[0].message;
		}

		return field && errors ? errors[field] : undefined;
	});
</script>

<div class={classname}>
	<div class={cn('flex flex-col gap-1.5')}>{@render children()}</div>
	{#if hint}
		<p class="text-muted-foreground text-sm">{hint}</p>
	{/if}
	{#if error}
		<p class="text-destructive text-sm">{error}</p>
	{/if}
</div>
