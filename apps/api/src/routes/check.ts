import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sql, or, ilike } from 'drizzle-orm'
import { db } from '../db/index.js'
import { perpetrators } from '../db/schema.js'
import { searchSchema } from '../utils/validators.js'
import { detectInputType, normalizePhoneNumber, maskAccountNumber, maskPhoneNumber, maskEntityName } from '../utils/masking.js'
import { checkRateLimit } from '../middleware/rate-limit.js'

const check = new Hono()

check.use('/*', checkRateLimit)

/**
 * GET /api/check?q=...
 * Main search endpoint — fuzzy matching across all perpetrator identifiers.
 * No authentication required.
 */
check.get('/', zValidator('query', searchSchema), async (c) => {
  const { q } = c.req.valid('query')
  const inputType = detectInputType(q)

  let results

  if (inputType === 'phone') {
    const normalized = normalizePhoneNumber(q)
    // Exact match first, then fuzzy
    results = await db
      .select()
      .from(perpetrators)
      .where(
        or(
          sql`replace(replace(replace(${perpetrators.phoneNumber}, '-', ''), ' ', ''), '+', '') ILIKE ${`%${normalized}%`}`,
          ilike(perpetrators.phoneNumber, `%${q}%`)
        )
      )
      .limit(20)
  } else if (inputType === 'account') {
    results = await db
      .select()
      .from(perpetrators)
      .where(
        or(
          ilike(perpetrators.accountNumber, `%${q}%`),
          sql`${perpetrators.accountNumber} ILIKE ${`%${q.replace(/\s/g, '')}%`}`
        )
      )
      .limit(20)
  } else {
    // Name search is disabled for UU ITE compliance.
    // Fallback: search the raw query against account and phone numbers anyway.
    results = await db
      .select()
      .from(perpetrators)
      .where(
        or(
          ilike(perpetrators.accountNumber, `%${q}%`),
          ilike(perpetrators.phoneNumber, `%${q}%`)
        )
      )
      .limit(20)
  }

  // Mask sensitive data in response
  const maskedResults = results.map((p) => ({
    id: p.id,
    accountNumber: maskAccountNumber(p.accountNumber),
    phoneNumber: maskPhoneNumber(p.phoneNumber),
    entityName: maskEntityName(p.entityName),
    bankName: p.bankName,
    accountType: p.accountType,
    threatLevel: p.threatLevel,
    totalReports: p.totalReports,
    verifiedReports: p.verifiedReports,
    firstReported: p.firstReported,
    lastReported: p.lastReported,
  }))

  return c.json({
    query: q,
    type: inputType,
    count: maskedResults.length,
    results: maskedResults,
  })
})

export default check
