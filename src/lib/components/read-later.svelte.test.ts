import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReadLater from './read-later.svelte';

describe('read-later component', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should render correctly', () => {
		render(ReadLater, {
			props: {
				itemId: 123,
				isMarked: false
			}
		});

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute('aria-pressed', 'false');
		expect(screen.getByText('Add to Read Later')).toBeInTheDocument();
	});

	it('should toggle state on click', async () => {
		const toggleMock = vi.fn();
		const user = userEvent.setup();

		render(ReadLater, {
			props: {
				itemId: 123,
				isMarked: false,
				onToggle: toggleMock
			}
		});

		const button = screen.getByRole('button');
		user.click(button);

		await waitFor(() => expect(toggleMock).toHaveBeenCalledTimes(1));

		expect(toggleMock).toHaveBeenCalledWith(123, true);
		expect(button).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByText('Remove from Read Later')).toBeInTheDocument();
	});
});
