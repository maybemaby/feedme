import { describe, expect, it } from 'vitest';
import { parseFeedContent } from './feeds';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('feeds', () => {
	it('should parse the rss feed content without error', () => {
		const rssXmlPath = path.join(process.cwd(), 'test', 'rss.xml');
		const exampleRss = readFileSync(rssXmlPath, 'utf8');

		const res = parseFeedContent(exampleRss);

		expect(res.isOk()).toBe(true);

		if (res.isOk()) {
			const feedItems = res.value;

			for (const item of feedItems) {
				expect(item.title).toBeTruthy();
				expect(item.sourceName).toBe('Golang Weekly');
				expect(item.publishedAt).toBeInstanceOf(Date);
				expect(item.description).toBeTruthy();
			}
		}
	});

	it('should normalize atom feed content without error', () => {
		// Read the actual atom XML file
		const atomXmlPath = path.join(process.cwd(), 'test', 'atom.xml');
		const atomContent = readFileSync(atomXmlPath, 'utf8');

		// Parse the atom feed with parseFeedContent
		const parseResult = parseFeedContent(atomContent);
		expect(parseResult.isOk()).toBe(true);

		if (parseResult.isOk()) {
			const feedItems = parseResult.value;

			// Verify we got items
			expect(feedItems.length).toBeGreaterThan(0);

			// Check the structure of each item
			for (const item of feedItems) {
				expect(item.title).toBeTruthy();
				expect(item.sourceName).toEqual('PyCoder’s Weekly');
				expect(item.url).toBeTruthy();
				expect(item.description).toBeTruthy();
				expect(item.publishedAt).toBeInstanceOf(Date);
			}

			// Check specific properties of the first item from the test atom feed
			const firstItem = feedItems[0];
			expect(firstItem.title).toContain('Issue #703');
			expect(firstItem.url).toBe('https://pycoders.com/issues/703');
		}
	});
});
