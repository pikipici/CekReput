import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/cekreput'

// Connection pool for queries
// prepare: false is required for Supabase transaction pooler (port 6543)
// ssl: 'require' is needed for Supabase hosted PostgreSQL
// max: 1 is required for Supabase pooler (port 6543)
const isSupabase = connectionString.includes('supabase')
const isPooler = connectionString.includes(':6543')
const queryClient = postgres(connectionString, {
  max: isPooler ? 1 : 10, // Pooler requires max 1 connection per client
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: isPooler ? false : true, // Must be false for pooler
  ssl: isSupabase ? 'require' : undefined,
})

export const db = drizzle(queryClient, { schema })

export type Database = typeof db
