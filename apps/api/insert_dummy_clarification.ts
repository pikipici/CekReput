import { db } from './src/db/index.js';
import { clarifications, perpetrators, users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function run() {
  try {
    const [perp] = await db.select().from(perpetrators).limit(1);
    const [user] = await db.select().from(users).limit(1);
    
    if (perp && user) {
      await db.insert(clarifications).values({
        perpetratorId: perp.id,
        requesterId: user.id,
        statement: 'Ini klarifikasi percobaan dengan multi-file bukti dari testing script.',
        status: 'pending',
        identityPhotoUrl: 'https://pub-4f0c21d1a2984b55868869034fa170d3.r2.dev/1772265309873-sss.png',
        selfiePhotoUrl: 'https://pub-4f0c21d1a2984b55868869034fa170d3.r2.dev/1772265309873-sss.png',
        identityName: 'Mr. Tester',
        identityNik: '9999999999999999',
        relationType: 'Pemilik Sendiri',
        evidenceUrls: [
          'https://pub-4f0c21d1a2984b55868869034fa170d3.r2.dev/1772265315105-ron.png',
          'https://pub-4f0c21d1a2984b55868869034fa170d3.r2.dev/1772265321550-skull.png'
        ]
      });
      console.log('Inserted dummy clarification with multiple evidenceUrls');
    } else {
      console.log('No perp or user found');
    }
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
run();
