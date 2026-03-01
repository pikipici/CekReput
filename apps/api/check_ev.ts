import { db } from './src/db/index.js';
import { evidenceFiles } from './src/db/schema.js';

async function check() {
  const files = await db.select().from(evidenceFiles);
  console.log('Total files:', files.length);
  for (const f of files) {
    console.log(`- ID: ${f.id} | ReportID: ${f.reportId} | File: ${f.fileName} | URL: ${f.fileUrl}`);
  }
  process.exit(0);
}

check();
