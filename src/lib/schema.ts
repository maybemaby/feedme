import { z } from 'zod';

export const findFeedItemsSchema = z.object({
	userId: z.string().optional(),
	feedId: z.string().optional(),
	slug: z.string().optional(),
	page: z.number().int().min(1).optional()
});

export type FindFeedItemsParams = z.infer<typeof findFeedItemsSchema>;
