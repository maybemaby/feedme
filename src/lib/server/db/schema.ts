import { validGenderSelector } from '../../config';
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	primaryKey,
	uniqueIndex,
	numeric,
	json,
	index
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const brands = pgTable('brands', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull().unique()
});

export const frames = pgTable(
	'frames',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: text('name').notNull(),
		brandId: integer('brand_id')
			.references(() => brands.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			})
			.notNull(),
		shape: text('shape').notNull(),
		material: text('material'),
		price: numeric('price', { scale: 2 }),
		color: text('color'),
		gender: text('gender').default('unisex'),
		link: text('link'),
		images: json('images').$type<string[]>(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		submittedById: text('submitted_by_id').references(() => user.id, {
			onDelete: 'set null',
			onUpdate: 'cascade'
		})
	},
	(t) => [
		{
			uniqueBrandName: uniqueIndex('unique_brand_name').on(t.brandId, t.name),
			priceIndex: index('frames_price_idx').on(t.price),
			shapeIndex: index('frames_shape_idx').on(t.shape),
			materialIndex: index('frames_material_idx').on(t.material)
		}
	]
);

export const insertFrameSchema = createInsertSchema(frames, {
	link: (s) => s.url(),
	brandId: z.coerce.number().int().positive(),
	gender: z.enum(validGenderSelector).optional(),
	price: (n) =>
		n
			.min(1, 'Price must be between 1 and 100,000')
			.max(100_000, 'Price must be between 1 and 100,000')
}).omit({
	createdAt: true,
	images: true,
	submittedById: true
});

export type InsertFrameInput = z.infer<typeof insertFrameSchema>;

export const frameRequests = pgTable('frame_requests', {
	frameId: integer('frame_id')
		.references(() => frames.id, {
			onUpdate: 'cascade',
			onDelete: 'cascade'
		})
		.notNull()
		.unique(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })
});

export const alternative = pgTable(
	'alternative',
	{
		alternativeId: integer('alternative_id')
			.references(() => frames.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			})
			.notNull(),
		frameId: integer('frame_id')
			.references(() => frames.id, {
				onDelete: 'restrict',
				onUpdate: 'cascade'
			})
			.notNull()
	},
	(t) => [
		{
			pKey: primaryKey({
				columns: [t.alternativeId, t.frameId],
				name: 'alternative_pkey'
			})
		}
	]
);
