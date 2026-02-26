import { sql } from 'drizzle-orm'
import { db } from './src/db/index.js'

async function run() {
  try {
    await db.execute(sql`ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "evidence_link" varchar(500);`)
    console.log('Migration applied successfully!')
  } catch (err) {
    console.error('Error applying migration:', err)
  }
  process.exit(0)
}

run()
