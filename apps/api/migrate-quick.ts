import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score integer DEFAULT 0 NOT NULL`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS badges text[]`);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  }
  process.exit(0);
}

main();
