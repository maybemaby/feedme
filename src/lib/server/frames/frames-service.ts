import { ilike, or, eq, and, getTableColumns, isNotNull } from 'drizzle-orm';
import { db, withPagination, type DBorTransaction, type PaginationOptions } from '../db';
import { alternative, brands, frameRequests, frames, type InsertFrameInput } from '../db/schema';
import type { RequestEvent } from '@sveltejs/kit';

export async function createBrand(name: string) {
	return db.insert(brands).values({
		name
	});
}

export async function searchBrands({ name }: { name: string }) {
	return db
		.select()
		.from(brands)
		.where(ilike(brands.name, `${name}%`))
		.limit(25);
}

export async function createFrame(
	input: InsertFrameInput & { userId: string; images?: string[] },
	driver?: DBorTransaction
) {
	const d = driver ?? db;

	const [res] = await d
		.insert(frames)
		.values({
			...input,
			submittedById: input.userId
		})
		.returning({
			id: frames.id
		});

	return res.id;
}

export async function createRequest(frameId: number, userId: string, driver?: DBorTransaction) {
	const d = driver ?? db;

	return d.insert(frameRequests).values({
		frameId,
		userId
	});
}

export function getFrameSearchParams(event: RequestEvent) {
	const brand = event.url.searchParams.get('brand');
	const shape = event.url.searchParams.get('shape');
	const color = event.url.searchParams.get('color');
	const name = event.url.searchParams.get('q') || '';
	const page = Number(event.url.searchParams.get('page')) || 1;

	return {
		name,
		brand: brand || undefined,
		shape: shape || undefined,
		color: color || undefined,
		page,
		size: 20
	};
}

/** Search and filter frames that have requests and are not alternates */
export async function searchFrames({
	name,
	brand,
	shape,
	...pagination
}: {
	name: string;
	brand?: string;
	shape?: string;
	includeAlternates?: boolean;
} & PaginationOptions) {
	const qb = db
		.select({
			...getTableColumns(frames),
			brandName: brands.name
		})
		.from(frames)
		.innerJoin(brands, eq(frames.brandId, brands.id))
		.leftJoin(frameRequests, eq(frames.id, frameRequests.frameId))
		.where(
			and(
				or(ilike(frames.name, `%${name}%`), ilike(brands.name, `%${name}%`)),
				brand ? eq(brands.name, brand) : undefined,
				shape ? eq(frames.shape, shape) : undefined,
				isNotNull(frameRequests.frameId)
			)
		)
		.$dynamic();

	return withPagination(qb, pagination);
}

export async function searchFramesAll({
	name,
	brand,
	shape,
	...pagination
}: {
	name: string;
	brand?: string;
	shape?: string;
	includeAlternates?: boolean;
} & PaginationOptions) {
	const qb = db
		.select({
			...getTableColumns(frames),
			brandName: brands.name
		})
		.from(frames)
		.innerJoin(brands, eq(frames.brandId, brands.id))
		.where(
			and(
				or(ilike(frames.name, `%${name}%`), ilike(brands.name, `%${name}%`)),
				brand ? eq(brands.name, brand) : undefined,
				shape ? eq(frames.shape, shape) : undefined
			)
		)
		.$dynamic();

	return withPagination(qb, pagination);
}

export async function addAlternative(
	frameId: number,
	alternativeId: number,
	driver?: DBorTransaction
) {
	const d = driver ?? db;

	return d.insert(alternative).values({
		frameId,
		alternativeId
	});
}

type FrameWithBrand = typeof frames.$inferSelect & { brandName: string };

export async function getFrameById(id: number): Promise<FrameWithBrand | undefined> {
	const [frame] = await db
		.select({
			...getTableColumns(frames),
			brandName: brands.name
		})
		.from(frames)
		.innerJoin(brands, eq(frames.brandId, brands.id))
		.where(eq(frames.id, id))
		.limit(1);

	return frame;
}

export async function getAlternativesForFrame(frameId: number) {
	return db
		.select({
			...getTableColumns(frames),
			brandName: brands.name
		})
		.from(alternative)
		.innerJoin(frames, eq(alternative.alternativeId, frames.id))
		.innerJoin(brands, eq(frames.brandId, brands.id))
		.where(eq(alternative.frameId, frameId));
}
