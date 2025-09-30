import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './(main)/+page.svelte';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page, {
			data: {
				loggedIn: true,
				feeds: [],
				feedItems: [
					{
						id: 1,
						feedId: 'feed1',
						url: 'http://example.com/item1',
						title: 'Item 1',
						content: 'Content of item 1',
						publishedAt: new Date(),
						createdAt: new Date(),
						feedSlug: 'feed-slug',
						feedName: 'Feed Name'
					}
				]
			}
		});
		expect(screen.getByText('Feed Name')).toBeInTheDocument();
		expect(screen.getByText('Item 1')).toBeInTheDocument();
	});
});
