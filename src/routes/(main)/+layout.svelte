<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth/client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import AppSearch from './search.svelte';
	import AddFeed from '$lib/components/add-feed.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import { PanelLeft } from '@lucide/svelte';
	import type { LayoutProps } from './$types';
	import { SvelteDate } from 'svelte/reactivity';

	let { data, children }: LayoutProps = $props();

	let latestFocusFetch = new SvelteDate();

	async function handleLogout() {
		await authClient.signOut();
		await invalidateAll();
	}

	const handleFocus = () => {
		const currentTime = Date.now();

		if (currentTime - latestFocusFetch.getDate() < 5000) {
			// If the last focus was less than 5 seconds ago, do nothing
			return;
		}

		console.log('Window focused, invalidating data...');
		invalidateAll();

		latestFocusFetch.setDate(Date.now());
	};
</script>

<svelte:window onfocus={handleFocus} />
<svelte:document
	onvisibilitychange={(e) => {
		if (e.currentTarget.visibilityState === 'visible') {
			handleFocus();
		}
	}}
/>

<div class="flex h-screen">
	<aside class="bg-card hidden h-full min-w-[300px] border-r lg:block">
		<Sidebar folderNodes={data.folderTree} />
	</aside>
	<div class="flex h-screen w-full grow flex-col">
		<header class="mx-auto flex w-full items-center justify-between gap-4 border-b p-3">
			<div>
				<Sheet.Root>
					<Sheet.Trigger class="lg:hidden">
						<PanelLeft />
					</Sheet.Trigger>
					<Sheet.Content class="pt-10 data-[state=open]:duration-300" side="left">
						<Sidebar folderNodes={data.folderTree} />
					</Sheet.Content>
				</Sheet.Root>
			</div>
			<div class="flex items-center gap-3">
				<AppSearch />
				<Popover.Root>
					<Popover.Trigger class="border-foreground size-8 shrink-0 border">
						<span class="sr-only">Add feed</span>
						+</Popover.Trigger
					>
					<Popover.Content sideOffset={12} align="end">
						<div>
							<AddFeed />
						</div>
					</Popover.Content>
				</Popover.Root>
				<nav class="flex items-center gap-3">
					{#if data.loggedIn}
						<Button
							class="border-foreground rounded-none border"
							onclick={handleLogout}
							variant="secondary"
							size="sm">Logout</Button
						>
					{:else}
						<Button class="border-foreground rounded-none border" href="/auth/login">Login</Button>
					{/if}
				</nav>
			</div>
		</header>
		<main class="relative mx-auto w-full grow overflow-y-scroll p-3">
			{@render children?.()}
		</main>
	</div>
</div>
