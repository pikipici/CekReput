import { db } from './src/db/index.js';
import { evidenceFiles } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function updateData() {
  const files = await db.select().from(evidenceFiles);
  
  let i = 1;
  for (const f of files) {
    if (f.fileName === 'sss.png') {
      const newName = `bukti_kasus_${i}.jpg`;
      const newUrl = `https://picsum.photos/seed/${f.id}/600/800.jpg`;
      
      await db.update(evidenceFiles)
              .set({ fileName: newName, fileUrl: newUrl })
              .where(eq(evidenceFiles.id, f.id));
      console.log(`Updated ${f.id} to ${newName}`);
      i++;
    }
  }
  process.exit(0);
}

updateData();
