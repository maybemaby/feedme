import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgSelect } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, {
	schema,
	logger: process.env.NODE_ENV === 'development' ? true : false
});

export type DBorTransaction = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type PaginationOptions = {
	page?: number;
	size?: number;
};

export function withPagination<T extends PgSelect>(
	qb: T,
	{ page = 1, size = 10 }: PaginationOptions
) {
	return qb.limit(size).offset((page - 1) * size);
}
