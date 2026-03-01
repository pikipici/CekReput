import { db } from './src/db/index.js'
import { clarifications } from './src/db/schema.js'
import { eq } from 'drizzle-orm'
import { users, perpetrators } from './src/db/schema.js'

async function check() {
  const all = await db.select().from(clarifications)
  console.log('All Clarifications:', all)

  const joined = await db
      .select({
        id: clarifications.id,
        perpetratorId: clarifications.perpetratorId,
        requesterId: clarifications.requesterId,
        status: clarifications.status,
        requesterName: users.name,
        perpetratorData: perpetrators.accountNumber,
      })
      .from(clarifications)
      .innerJoin(users, eq(clarifications.requesterId, users.id))
      .innerJoin(perpetrators, eq(clarifications.perpetratorId, perpetrators.id))
      .where(eq(clarifications.status, 'pending'))

  console.log('Joined Clarifications:', joined)
  process.exit(0)
}

check().catch(console.error)
