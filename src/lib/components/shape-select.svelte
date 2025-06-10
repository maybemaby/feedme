<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { ComponentProps } from 'svelte';
	import { validShapes } from '../config';
	import FormGroup from './form-group.svelte';

	let {
		errors = $bindable(),
		required
	}: { errors: ComponentProps<typeof FormGroup>['errors']; required?: boolean } = $props();
	let selectedShape = $state('');
	let shapePlaceholder = $derived(selectedShape.length > 0 ? selectedShape : 'Select a shape');
</script>

<FormGroup {errors} field="shape">
	<Label for="shape">Shape</Label>
	<Select.Root name="shape" type="single" {required} bind:value={selectedShape}>
		<Select.Trigger class="w-[180px]">{shapePlaceholder}</Select.Trigger>
		<Select.Content>
			{#each validShapes as shape (shape)}
				<Select.Item value={shape}>{shape}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</FormGroup>
