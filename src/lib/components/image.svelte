<script lang="ts">
	import { Image } from '@unpic/svelte';
	import { transform } from 'unpic/providers/cloudflare';

	import type { ComponentProps } from 'svelte';

	type ImageProps = ComponentProps<typeof Image>;

	const { ...rest }: ImageProps = $props();

	// const attrs = transform(rest.src, {

	// }, {

	// });
</script>

<Image
	options={{
		cloudflare: {}
	}}
	{...rest}
/>
