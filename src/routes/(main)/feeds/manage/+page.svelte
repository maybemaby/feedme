<script lang="ts">
	import type { PageProps } from './$types';
	import * as Table from '$lib/components/ui/table/index';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: PageProps = $props();
</script>

<h1 class="my-4 text-2xl">Manage Feeds</h1>

<Table.Root>
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
					<Button class="rounded-none active:scale-95" href={`/feeds/manage/${feed.slug}`}
						>Edit</Button
					>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
