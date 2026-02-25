import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/cekreput'

// Connection pool for queries
// prepare: false is required for Supabase transaction pooler (port 6543)
// ssl: 'require' is needed for Supabase hosted PostgreSQL
const isSupabase = connectionString.includes('supabase')
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  ssl: isSupabase ? 'require' : undefined,
})

export const db = drizzle(queryClient, { schema })

export type Database = typeof db
