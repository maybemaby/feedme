import { drizzle } from 'drizzle-orm/libsql';
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core';
import * as schema from './sqlite-schema';
import { env } from '$env/dynamic/private';
import type { Logger } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const logger: Logger = {
	logQuery(query, params) {
		const trimmedParams = params.map((p) =>
			typeof p === 'string' && p.length > 100 ? p.slice(0, 100) + '...' : p
		);
		console.log(`EXECUTING QUERY: ${query} -- PARAMS: ${trimmedParams}`);
	}
};

function createDb() {
	return drizzle({
		schema,
		logger: process.env.NODE_ENV === 'development' ? logger : false,
		connection: {
			url: env.DATABASE_URL
		}
	});
}
let _db: ReturnType<typeof createDb>;

export function getDb() {
	if (!_db) {
		_db = createDb();
	}
	return _db;
}

export type DBorTransaction = typeof _db | Parameters<Parameters<typeof _db.transaction>[0]>[0];

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
