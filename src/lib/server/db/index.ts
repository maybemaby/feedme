import { drizzle } from 'drizzle-orm/libsql';
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core';
import * as schema from './sqlite-schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = drizzle({
	schema,
	logger: process.env.NODE_ENV === 'development' ? true : false,
	connection: {
		url: env.DATABASE_URL
	}
});

export type DBorTransaction = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type PaginationOptions = {
	page?: number;
	size?: number;
};

export function withPagination<T extends SQLiteSelect>(
	qb: T,
	{ page = 1, size = 10 }: PaginationOptions
) {
	return qb.limit(size).offset((page - 1) * size);
}
