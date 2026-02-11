<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { exportFeeds } from './export.remote';
	import { getUserFeeds } from '$lib/feeds/feeds.remote';
	
	let feeds = await getUserFeeds();
	let selectedFeedIds = new SvelteSet<string>();
	let isExporting = $state(false);
	let exportError = $state<string | null>(null);
	let exportSuccess = $state(false);

	function toggleFeed(feedId: string) {
		if (selectedFeedIds.has(feedId)) {
			selectedFeedIds.delete(feedId);
		} else {
			selectedFeedIds.add(feedId);
		}
	}

	function selectAll() {
		for (const feed of feeds) {
			selectedFeedIds.add(feed.id);
		}
	}

	function deselectAll() {
		selectedFeedIds.clear();
	}

	async function handleExport() {
		if (selectedFeedIds.size === 0) {
			exportError = 'Please select at least one feed to export';
			return;
		}

		isExporting = true;
		exportError = null;
		exportSuccess = false;

		try {
			const result = await exportFeeds({ feedIds: Array.from(selectedFeedIds) });

			// Generate timestamped filename
			const now = new Date();
			const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0] + 'Z';
			const filename = `feeds-export-${timestamp}.json`;

			// Create blob and trigger download
			const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			exportSuccess = true;
			selectedFeedIds.clear();

			// Clear success message after 3 seconds
			setTimeout(() => {
				exportSuccess = false;
			}, 3000);
		} catch (err) {
			exportError = err instanceof Error ? err.message : 'Failed to export feeds';
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-2 text-2xl">Export Feeds</h1>
	<p class="mb-4">Select the feeds you want to export.</p>

	{#if feeds.length === 0}
		<p class="text-gray-500">No feeds to export</p>
	{:else}
		<div class="mb-4 flex gap-2">
			<Button onclick={selectAll} variant="outline">Select All</Button>
			<Button onclick={deselectAll} variant="outline">Deselect All</Button>
		</div>

		<div class="mb-6 space-y-3 rounded border p-4">
			{#each feeds as feed (feed.id)}
				<div class="flex items-center gap-3">
					<input
						type="checkbox"
						id={`feed-${feed.id}`}
						checked={selectedFeedIds.has(feed.id)}
						onchange={() => toggleFeed(feed.id)}
						class="h-4 w-4 cursor-pointer"
					/>
					<label
						for={`feed-${feed.id}`}
						class="flex-1 cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						<div class="font-semibold">{feed.name}</div>
						<div class="text-xs text-gray-600">{feed.url}</div>
					</label>
				</div>
			{/each}
		</div>

		{#if exportError}
			<div class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
				{exportError}
			</div>
		{/if}

		{#if exportSuccess}
			<div class="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
				Feeds exported successfully!
			</div>
		{/if}

		<Button
			onclick={handleExport}
			disabled={selectedFeedIds.size === 0 || isExporting}
			class="w-full rounded-none"
		>
			{#if isExporting}
				Exporting...
			{:else}
				Export {selectedFeedIds.size > 0 ? `(${selectedFeedIds.size})` : ''} Feeds
			{/if}
		</Button>
	{/if}
</div>
