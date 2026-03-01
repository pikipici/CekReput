import { sql } from 'drizzle-orm'
import { db } from './src/db/index.js'

async function run() {
  try {
    await db.execute(sql`ALTER TABLE "perpetrators" ADD COLUMN IF NOT EXISTS "total_loss" integer DEFAULT 0 NOT NULL;`)
    await db.execute(sql`ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "loss_amount" integer;`)
    console.log('Migration applied successfully!')
  } catch (err) {
    console.error('Error applying migration:', err)
  }
  process.exit(0)
}

run()
