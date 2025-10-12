import { seed } from 'drizzle-seed';
import { getDb } from '.';
import { feeds } from './sqlite-schema';

async function main() {
	await seed(db, { feeds }).refine((f) => ({
		feeds: {
			count: 50,
			columns: {
				name: f.companyName()
			}
		}
	}));
}

main()
	.then(() => {
		console.log('Seeding completed successfully.');
	})
	.catch(console.error);
