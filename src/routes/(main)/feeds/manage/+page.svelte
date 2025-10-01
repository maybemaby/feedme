<script lang="ts">
	import type { PageProps } from './$types';
	import * as Table from '$lib/components/ui/table/index';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: PageProps = $props();
</script>

<Table.Root class="max-w-screen-xl">
	<Table.Header class="border">
		<Table.Row>
			<Table.Head class="text-lg">Feed</Table.Head>
			<Table.Head class="text-lg"></Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="border">
		{#each data.feeds as feed (feed.id)}
			<Table.Row>
				<Table.Cell class="border text-lg">{feed.name}</Table.Cell>
				<Table.Cell class="text-center">
					<Button class="h-full w-full rounded-none" href={`/feeds/manage/${feed.slug}`}
						>Edit</Button
					>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
