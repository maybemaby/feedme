import { uniqueIndex } from 'drizzle-orm/sqlite-core';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const bothCascade = { onDelete: 'cascade', onUpdate: 'cascade' } as const;

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	role: text('role').notNull().default('user')
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id)
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refreshTokenExpiresAt', {
		mode: 'timestamp'
	}),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }),
	updatedAt: integer('updatedAt', { mode: 'timestamp' })
});

export const feeds = sqliteTable(
	'feeds',
	{
		id: text('id').primaryKey(),
		url: text('url').notNull(),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, bothCascade),
		// Some dot separated path like "news.technology", "sports.football", separators indicating subfolders
		folderPath: text('folder_path').notNull().default('')
	},
	(table) => [
		uniqueIndex('user_name_idx').on(table.userId, table.name),
		uniqueIndex('user_url_idx').on(table.userId, table.url),
		uniqueIndex('user_slug_idx').on(table.userId, table.slug)
	]
);

export const feedItems = sqliteTable('feed_items', {
	id: int('id').primaryKey({ autoIncrement: true }),
	feedId: text('feed_id')
		.notNull()
		.references(() => feeds.id, bothCascade),
	title: text('title').notNull(),
	url: text('url').notNull().unique(),
	content: text('content').notNull(),
	publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

export type InsertFeedItem = typeof feedItems.$inferInsert;

export const tags = sqliteTable('tags', {
	id: int('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const feedTags = sqliteTable('feed_tags', {
	id: int('id').primaryKey(),
	feedId: text('feed_id')
		.notNull()
		.references(() => feeds.id, bothCascade),
	tagId: int('tag_id')
		.notNull()
		.references(() => tags.id, bothCascade)
});
