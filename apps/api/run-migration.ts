import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// read .env
const env = process.env;

const sql = postgres(env.DATABASE_URL as string);

async function run() {
  const file = fs.readFileSync(path.join(process.cwd(), 'src', 'db', 'migrations', '0003_motionless_zeigeist.sql'), 'utf-8');
  console.log('Executing migration 0003...');
  await sql.unsafe(file);
  console.log('Migration completed.');
  process.exit(0);
}

run().catch(console.error);
