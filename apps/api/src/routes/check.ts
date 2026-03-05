import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sql, or, ilike, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { perpetrators, reports } from '../db/schema.js'
import { searchSchema } from '../utils/validators.js'
import { detectInputType, normalizePhoneNumber, maskAccountNumber, maskPhoneNumber, maskEntityName } from '../utils/masking.js'
import { checkRateLimit } from '../middleware/rate-limit.js'
import redis from '../lib/redis.js'

const check = new Hono()

check.use('/*', checkRateLimit)

/**
 * GET /api/check?q=...
 * Main search endpoint — fuzzy matching across all perpetrator identifiers.
 * No authentication required.
 */
check.get('/', zValidator('query', searchSchema), async (c) => {
  const { q, filter } = c.req.valid('query')
  const inputType = detectInputType(q)

  const cacheKey = `check:${q}:${filter || 'all'}`
  try {
    const cachedData = await redis.get(cacheKey)
    if (cachedData) {
      return c.json(JSON.parse(cachedData))
    }
  } catch (err) {
    console.error('Redis Error on GET check:', err)
  }

  let results

  let condition = or(
    ilike(perpetrators.accountNumber, `%${q}%`),
    ilike(perpetrators.phoneNumber, `%${q}%`),
    sql`${reports.category} = 'hackback' AND ${reports.chronology} ILIKE ${'%(' + q + ')]%'}`
  )

  if (filter === 'ID Game') {
    condition = sql`${reports.category} = 'hackback' AND ${reports.chronology} ILIKE ${'%(' + q + ')]%'}`
  } else if (filter === 'Rekening Bank') {
    condition = sql`${perpetrators.accountType} = 'bank' AND (${perpetrators.accountNumber} ILIKE ${`%${q.replace(/\s/g, '')}%`} OR ${perpetrators.accountNumber} ILIKE ${`%${q}%`})`
  } else if (filter === 'E-Wallet') {
    condition = sql`${perpetrators.accountType} = 'ewallet' AND (${perpetrators.accountNumber} ILIKE ${`%${q.replace(/\s/g, '')}%`} OR ${perpetrators.accountNumber} ILIKE ${`%${q}%`})`
  } else if (filter === 'Nomor Telepon') {
    const normalized = normalizePhoneNumber(q)
    condition = or(
      sql`replace(replace(replace(${perpetrators.phoneNumber}, '-', ''), ' ', ''), '+', '') ILIKE ${`%${normalized}%`}`,
      ilike(perpetrators.phoneNumber, `%${q}%`)
    )
  } else {
    // "Semua" or undefined/empty filter
    if (inputType === 'phone') {
      const normalized = normalizePhoneNumber(q)
      condition = or(
        sql`replace(replace(replace(${perpetrators.phoneNumber}, '-', ''), ' ', ''), '+', '') ILIKE ${`%${normalized}%`}`,
        ilike(perpetrators.phoneNumber, `%${q}%`)
      )
    } else if (inputType === 'account') {
      condition = or(
        ilike(perpetrators.accountNumber, `%${q}%`),
        sql`${perpetrators.accountNumber} ILIKE ${`%${q.replace(/\s/g, '')}%`}`,
        sql`${reports.category} = 'hackback' AND ${reports.chronology} ILIKE ${'%(' + q + ')]%'}`
      )
    }
  }

  results = await db
    .select({
        id: perpetrators.id,
        accountNumber: perpetrators.accountNumber,
        phoneNumber: perpetrators.phoneNumber,
        entityName: perpetrators.entityName,
        bankName: perpetrators.bankName,
        accountType: perpetrators.accountType,
        threatLevel: perpetrators.threatLevel,
        totalReports: perpetrators.totalReports,
        verifiedReports: perpetrators.verifiedReports,
        firstReported: perpetrators.firstReported,
        lastReported: perpetrators.lastReported,
        matchedChronology: sql<string>`max(case when ${reports.category} = 'hackback' and ${reports.chronology} ilike ${'%(' + q + ')]%'} then ${reports.chronology} else null end)`
    })
    .from(perpetrators)
    .leftJoin(reports, eq(perpetrators.id, reports.perpetratorId))
    .where(condition)
    // SECURITY FIX: Only return perpetrators with at least one verified report
    .having(sql`COUNT(CASE WHEN ${reports.status} = 'verified' THEN 1 END) > 0 OR ${perpetrators.verifiedReports} > 0`)
    .groupBy(
        perpetrators.id,
        perpetrators.accountNumber,
        perpetrators.phoneNumber,
        perpetrators.entityName,
        perpetrators.bankName,
        perpetrators.accountType,
        perpetrators.threatLevel,
        perpetrators.totalReports,
        perpetrators.verifiedReports,
        perpetrators.firstReported,
        perpetrators.lastReported
    )
    .limit(20)

  // Mask sensitive data in response
  const maskedResults = results.map((p) => {
    let matchedGameId = null
    let matchedGameType = null

    const matchedChronology = p.matchedChronology as string | null
    if (matchedChronology) {
      const match = matchedChronology.match(/^\[Target Hak milik: Akun (.+?) \((.+?)\)\]\s*\n\n([\s\S]*)$/)
      if (match) {
        matchedGameType = match[1]
        matchedGameId = match[2]
      }
    }

    return {
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
      matchedGameId,
      matchedGameType,
    }
  })


  const responseData = {
    query: q,
    type: inputType,
    count: maskedResults.length,
    results: maskedResults,
  }

  try {
    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300)
  } catch (err) {
    console.error('Redis Set Error:', err)
  }

  return c.json(responseData)
})

export default check
