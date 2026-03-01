import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Running SQL...');
  try {
    await db.execute(sql`ALTER TABLE "clarifications" ADD COLUMN "evidence_urls" text[];`);
    console.log('Added evidence_urls column.');
    await db.execute(sql`ALTER TABLE "clarifications" DROP COLUMN "evidence_url";`);
    console.log('Dropped evidence_url column.');
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit();
}

run();
