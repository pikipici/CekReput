/**
 * Update some report timestamps to be recent for the live ticker.
 * Run: npx tsx --env-file .env src/db/fix-recent.ts
 */
import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function run() {
  // Set the 10 most recent reports to have been created in the last 2 days
  await db.execute(sql`
    UPDATE reports SET created_at = NOW() - interval '5 minutes' * row_number
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_number
      FROM reports
      LIMIT 10
    ) sub
    WHERE reports.id = sub.id
  `)
  console.log('✅ Updated 10 most recent reports to have recent timestamps')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
