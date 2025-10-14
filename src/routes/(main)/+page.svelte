<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';
	import FeedView from '$lib/components/feed-view.svelte';
	import { PersistedState } from 'runed';

	const { data } = $props();

	// State for view mode
	let viewMode = new PersistedState('feedViewMode', 'list' as 'list' | 'grid');

	$inspect(viewMode.current);

	const navigatePage = (page: number) => {
		goto(`/?p=${page}`);
	};
</script>

<div class="flex flex-col">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl font-bold">All Feeds</h1>

		<!-- View toggle buttons -->
		<div class="flex gap-2">
			<Button
				variant={viewMode.current === 'list' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (viewMode.current = 'list')}
			>
				<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 10h16M4 14h16M4 18h16"
					/>
				</svg>
				List
			</Button>
			<Button
				variant={viewMode.current === 'grid' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (viewMode.current = 'grid')}
			>
				<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
					/>
				</svg>
				Grid
			</Button>
		</div>
	</div>

	<FeedView feedItems={data.feedItems} viewMode={viewMode.current} />
	<Pagination.Root count={data.feedCount} perPage={20} page={data.page} onPageChange={navigatePage}>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
