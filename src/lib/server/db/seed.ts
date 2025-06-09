import { seed } from "drizzle-seed";
import { db } from ".";
import { brands } from "./schema";

async function main() {
  await seed(db, { brands }).refine((f) => ({
    brands: {
      count: 50,
      columns: {
        name: f.companyName(),
      },
    },
  }));
}

main()
  .then(() => {
    console.log("Seeding completed successfully.");
  })
  .catch(console.error);
