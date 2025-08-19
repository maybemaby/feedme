<script lang="ts">
	import { enhance } from '$app/forms';
	import FormGroup from '$lib/components/form-group.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import ShapeSelect from '$lib/components/shape-select.svelte';
	import GenderSelect from '$lib/components/gender-select.svelte';
	import { page } from '$app/state';

	let { form, data } = $props();

	let selectedBrand = $state('');
	let brandPlaceholder = $derived(
		selectedBrand
			? data.brands.find((b) => b.id.toString() === selectedBrand)?.name
			: 'Select a brand'
	);

	let alternateFor = $derived(page.url.searchParams.get('alternateFor'));
</script>

<div>
	<h1 class="mb-6 text-xl">
		{#if alternateFor}
			Add Alternate Frame
		{:else}
			Request Alternatives for a Frame
		{/if}
	</h1>

	{#if form?.success}
		<Alert.Root class="mb-6">
			<Alert.Title class="text-green-600">Success</Alert.Title>
			<Alert.Description class="inline">
				Your request has been submitted succesfully. Check on it <a
					class="text-primary inline underline"
					href={`/frames/${form.id}`}
				>
					here.</a
				>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<form use:enhance enctype="multipart/form-data" method="post" class="flex flex-col gap-5">
		<div class="flex items-end gap-3">
			<FormGroup classname="flex-1" errors={form?.fields} field="name">
				<Label for="name">Name</Label>
				<Input id="name" name="name" placeholder="Barnaby" type="text" required />
			</FormGroup>
			<FormGroup classname="flex-1">
				<Label for="link">Link</Label>
				<Input id="link" name="link" placeholder="https://glasses-site.com" type="text" required />
			</FormGroup>
		</div>

		<FormGroup errors={form?.fields} field="brandId">
			<Label for="brand">Brand</Label>

			<Select.Root name="brandId" type="single" required bind:value={selectedBrand}>
				<Select.Trigger class="w-[180px] overflow-clip">
					{brandPlaceholder}
				</Select.Trigger>
				<Select.Content>
					{#each data.brands as brand (brand.id)}
						<Select.Item value={brand.id.toString()}>{brand.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</FormGroup>

		<ShapeSelect required errors={form?.fields} />

		<FormGroup errors={form?.fields} field="price" hint="Price in USD">
			<Label for="price">Price</Label>
			<Input
				id="price"
				name="price"
				placeholder="100"
				type="number"
				required
				min={1}
				max={100_000}
			/>
		</FormGroup>

		<FormGroup hint="Optional" errors={form?.fields} field="color">
			<Label for="color">Color</Label>
			<Input id="color" name="color" placeholder="Black" type="text" />
		</FormGroup>

		<GenderSelect required errors={form?.fields} />

		<FormGroup field={'image'} errors={form?.fields}>
			<Label for="image">Image</Label>
			<Input id="image" name="image" type="file" accept="image/*,.jpeg,.png,.webp,.avif" />
		</FormGroup>

		{#if alternateFor}
			<input type="hidden" name="alternateFor" value={alternateFor} />
		{/if}

		<Button type="submit" class="w-full">Submit Frame</Button>
	</form>
</div>
