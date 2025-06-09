<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '@//auth/client.js';
	import { Button } from '@//components/ui/button/index.js';

	let { data, children } = $props();

	async function handleLogout() {
		await authClient.signOut();
		await invalidateAll();
	}
</script>

<div class="flex h-screen flex-col">
	<header class="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 p-3">
		<a href="/" class="text-xl"> Alternative Frames </a>
		<nav class="hidden items-center gap-3 md:flex">
			{#if data.loggedIn}
				<Button onclick={handleLogout} variant="secondary" size="sm">Logout</Button>
			{:else}
				<Button href="/auth/login">Login</Button>
			{/if}
		</nav>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>
