import { db } from './src/db/index.js';
import { reports, evidenceFiles } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function check() {
  const rpts = await db.select().from(reports).orderBy(reports.createdAt);
  for (const r of rpts) {
    const files = await db.select().from(evidenceFiles).where(eq(evidenceFiles.reportId, r.id));
    console.log(`Report #${r.id.substring(0,8)} | Category: ${r.category} | File count: ${files.length}`);
    files.forEach(f => console.log(`   -> File: ${f.fileName} (${f.fileUrl})`));
  }
  process.exit(0);
}

check();
