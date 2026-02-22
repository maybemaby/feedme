<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { exportFeeds, importFeeds, type ImportResult } from './export.remote';
	import { getUserFeeds } from '$lib/feeds/feeds.remote';

	let feeds = $state(await getUserFeeds());
	let selectedFeedIds = new SvelteSet<string>();
	let activeTab = $state<'export' | 'import'>('export');

	// Export state
	let isExporting = $state(false);
	let exportError = $state<string | null>(null);
	let exportSuccess = $state(false);

	// Import state
	let isImporting = $state(false);
	let importError = $state<string | null>(null);
	let importSuccess = $state(false);
	let importResult = $state<ImportResult | null>(null);
	let fileInput = $state<HTMLInputElement | undefined>();

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

	async function handleImport() {
		if (!fileInput?.files?.[0]) {
			importError = 'Please select a file to import';
			return;
		}

		const file = fileInput.files[0];

		// Check file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			importError = 'File size exceeds 5MB limit';
			return;
		}

		isImporting = true;
		importError = null;
		importSuccess = false;
		importResult = null;

		try {
			const content = await file.text();
			const result = await importFeeds({ jsonContent: content, fileName: file.name });

			importResult = result;
			importSuccess = true;

			// Reset file input
			if (fileInput) {
				fileInput.value = '';
			}

			// Refresh the feeds list
			feeds = await getUserFeeds();

			// Clear success message after 5 seconds
			setTimeout(() => {
				importSuccess = false;
			}, 5000);
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to import feeds';
		} finally {
			isImporting = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold">Feed Management</h1>

	<!-- Tab Navigation -->
	<div class="mb-6 flex border-b">
		<button
			onclick={() => (activeTab = 'export')}
			class="px-4 py-2 font-medium transition-colors {activeTab === 'export'
				? 'border-secondary text-secondary-foreground border-b-2 font-bold'
				: 'text-gray-600 hover:text-gray-900'}"
		>
			Export
		</button>
		<button
			onclick={() => (activeTab = 'import')}
			class="px-4 py-2 font-medium transition-colors {activeTab === 'import'
				? 'border-secondary text-secondary-foreground border-b-2 font-bold'
				: 'text-gray-600 hover:text-gray-900'}"
		>
			Import
		</button>
	</div>

	<!-- Export Tab -->
	{#if activeTab === 'export'}
		<div>
			<h2 class="mb-2 text-lg font-semibold">Export Feeds</h2>
			<p class="mb-4 text-sm text-gray-600">Select the feeds you want to export.</p>

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
					class="w-full"
				>
					{#if isExporting}
						Exporting...
					{:else}
						Export {selectedFeedIds.size > 0 ? `(${selectedFeedIds.size})` : ''} Feeds
					{/if}
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Import Tab -->
	{#if activeTab === 'import'}
		<div>
			<h2 class="mb-2 text-lg font-semibold">Import Feeds</h2>
			<p class="mb-4 text-sm text-gray-600">
				Select a JSON file exported from Feed Manager to import feeds.
			</p>

			<div class="mb-6 rounded border border-dashed p-6">
				<input
					bind:this={fileInput}
					type="file"
					accept=".json"
					class="block w-full text-sm text-gray-900"
					disabled={isImporting}
				/>
				<p class="mt-2 text-xs text-gray-500">Max file size: 5MB</p>
			</div>

			{#if importError}
				<div class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
					{importError}
				</div>
			{/if}

			{#if importSuccess && importResult}
				<div class="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
					<div class="font-semibold">Import completed!</div>
					<div class="mt-1 text-xs">
						<div>Imported: {importResult.imported} feeds</div>
						{#if importResult.skipped > 0}
							<div>Skipped: {importResult.skipped} duplicate feeds</div>
						{/if}
						{#if importResult.errors.length > 0}
							<div class="mt-2">
								<div class="font-semibold">Errors:</div>
								<ul class="mt-1 list-inside list-disc">
									{#each importResult.errors as error (error)}
										<li>{error}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<Button
				onclick={handleImport}
				disabled={!fileInput?.files?.[0] || isImporting}
				class="w-full"
			>
				{#if isImporting}
					<span>Importing...</span>
				{:else}
					Import Feeds
				{/if}
			</Button>
		</div>
	{/if}
</div>
