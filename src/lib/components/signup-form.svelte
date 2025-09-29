<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { authClient } from '../auth/client';
	import { goto } from '$app/navigation';

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	const id = $props.id();

	const formState = $state({
		email: '',
		password: '',
		passwordConfirm: ''
	});

	const handleSubmit = async () => {
		const res = await authClient.signUp.email({
			email: formState.email,
			name: formState.email,
			password: formState.password
		});

		if (!res.error) {
			await goto('/');
		}
	};
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Create an account</Card.Title>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit}>
				<div class="grid gap-6">
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="email-{id}">Email</Label>
							<Input
								id="email-{id}"
								type="email"
								placeholder="m@example.com"
								required
								bind:value={formState.email}
							/>
						</div>
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password-{id}">Password</Label>
							</div>
							<Input id="password-{id}" type="password" required bind:value={formState.password} />
						</div>
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password-confirm">Confirm Password</Label>
							</div>
							<Input
								id="password-confirm"
								type="password"
								required
								bind:value={formState.passwordConfirm}
							/>
						</div>
						<Button type="submit" class="w-full">Sign up</Button>
					</div>
					<div class="text-center text-sm">
						Already have an account?
						<a href="/auth/login" class="underline underline-offset-4"> Log in </a>
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
