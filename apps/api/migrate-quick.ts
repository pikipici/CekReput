import 'dotenv/config';
import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const isSupabase = !!process.env.DATABASE_URL?.includes('supabase');
    if (isSupabase) {
      console.log('Connecting to Supabase...');
    }

    // Add emailVerified to users
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false NOT NULL`);
    console.log('Added email_verified column');

    // Create otp_codes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL,
        code varchar(6) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    console.log('Created otp_codes table');

    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  }
  process.exit(0);
}

main();
