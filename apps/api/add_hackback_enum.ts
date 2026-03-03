import { db } from './src/db/index.js'
import { sql } from 'drizzle-orm'

async function run() {
  try {
    await db.execute(sql`ALTER TYPE "public"."report_category" ADD VALUE 'hackback' BEFORE 'other';`)
    console.log('Successfully added hackback to report_category enum')
  } catch (error: any) {
    if (error.code === '42710') { // duplicate_object
      console.log('Enum value already exists, skipping')
    } else {
      console.error('Failed to alter type:', error)
    }
  }
  process.exit()
}

run()
