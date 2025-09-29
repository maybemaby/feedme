<script lang="ts">
	const { data } = $props();
</script>

<div class="flex min-h-[300px] flex-col justify-center py-14">
	<ul>
		{#each data.feeds as feed}
			<li>{feed.name}</li>
		{/each}
	</ul>
</div>
