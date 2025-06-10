<script lang="ts">
	import Search from '$lib/components/search.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="w-[400px] max-w-full">
		<p>Search for an existing frame</p>
		<Search placeholder="Search by brand or name" />
	</div>

	<div class="my-2">
		<p class="text-lg">or</p>
	</div>

	<Button href={`/frames/new?alternateFor=${data.frame.id}`}>Add new frame to database</Button>
</div>
