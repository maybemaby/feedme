<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth/client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import AddFeed from '$lib/components/add-feed.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';

	let { data, children } = $props();

	async function handleLogout() {
		await authClient.signOut();
		await invalidateAll();
	}
</script>

<div class="flex h-screen">
	<Sidebar />
	<div class="w-full grow">
		<header class="mx-auto flex w-full items-center justify-between gap-4 p-3">
			<div>Placehold</div>
			<div class="hidden items-center gap-3 md:flex">
				<Popover.Root>
					<Popover.Trigger class="border-foreground h-8 w-8 border">+</Popover.Trigger>
					<Popover.Content>
						<div>
							<AddFeed />
						</div>
					</Popover.Content>
				</Popover.Root>
				<nav class="flex items-center gap-3">
					{#if data.loggedIn}
						<Button onclick={handleLogout} variant="secondary" size="sm">Logout</Button>
					{:else}
						<Button href="/auth/login">Login</Button>
					{/if}
				</nav>
			</div>
		</header>
		<main class="mx-auto w-full grow p-3">
			{@render children?.()}
		</main>
	</div>
</div>
