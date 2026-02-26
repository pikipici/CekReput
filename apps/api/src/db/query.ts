import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { reports } from './schema.js'
import { eq } from 'drizzle-orm'

const connectionString = 'postgresql://postgres.pkvydjnccbjektstfnly:aqV8m9jQWB0WL8lR@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client)

async function check() {
  const all = await db.select().from(reports).where(eq(reports.perpetratorId, '487b3449-feb1-45a6-9c8f-708160f0481f'))
  console.log(JSON.stringify(all, null, 2))
  process.exit(0)
}

check()
