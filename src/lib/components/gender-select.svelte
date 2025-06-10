<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { ComponentProps } from 'svelte';
	import { validGenderSelector } from '../config';
	import FormGroup from './form-group.svelte';

	let {
		errors = $bindable(),
		required
	}: { errors: ComponentProps<typeof FormGroup>['errors']; required?: boolean } = $props();
	let selectedGender = $state('');
	let genderPlaceholder = $derived(selectedGender.length > 0 ? selectedGender : 'Select gender');
</script>

<FormGroup {errors} field="shape">
	<Label for="gender">Gender</Label>
	<Select.Root name="gender" type="single" {required} bind:value={selectedGender}>
		<Select.Trigger class="w-[180px]">{genderPlaceholder}</Select.Trigger>
		<Select.Content>
			{#each validGenderSelector as gender (gender)}
				<Select.Item value={gender}>{gender}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</FormGroup>
