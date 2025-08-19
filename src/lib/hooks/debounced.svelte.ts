export function debounce<TValue>(callback: (v: TValue) => unknown, debounceMs: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (value: TValue) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			callback(value);
			timeout = null;
		}, debounceMs);
	};
}

export function debounced<TValue>(getter: () => TValue, debounceMs: number) {
	let current = $state(getter());

	const update = debounce<TValue>((v) => (current = v), debounceMs);

	$effect(() => update(getter()));

	return () => current;
}
