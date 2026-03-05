import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc, ilike } from 'drizzle-orm'
import { db } from '../db/index.js'
import { apiKeys, perpetrators } from '../db/schema.js'
import { createApiKeySchema, searchSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import { apiKeyMiddleware, generateApiKey } from '../middleware/api-key.js'
import { apiRateLimit } from '../middleware/rate-limit.js'
import { maskAccountNumber, maskPhoneNumber, maskEntityName, detectInputType, normalizePhoneNumber } from '../utils/masking.js'
import type { JwtPayload } from '../middleware/auth.js'

const developer = new Hono()

// ─── Public Developer API (API Key required) ─────────────────────

const v1 = new Hono()
v1.use('/*', apiKeyMiddleware, apiRateLimit)

/**
 * GET /api/v1/check?q=...
 * Simplified check endpoint for external integrations.
 */
v1.get('/check', zValidator('query', searchSchema), async (c) => {
  const { q } = c.req.valid('query')
  const inputType = detectInputType(q)

  let results
  const normalizedQ = inputType === 'phone' ? normalizePhoneNumber(q) : q

  if (inputType === 'phone') {
    results = await db.select().from(perpetrators)
      .where(ilike(perpetrators.phoneNumber, `%${normalizedQ}%`))
      .limit(10)
  } else if (inputType === 'account') {
    results = await db.select().from(perpetrators)
      .where(ilike(perpetrators.accountNumber, `%${q}%`))
      .limit(10)
  } else {
    results = await db.select().from(perpetrators)
      .where(ilike(perpetrators.entityName, `%${q}%`))
      .limit(10)
  }

  // Simplified response for API consumers
  const data = results.map((p) => ({
    id: p.id,
    accountNumber: maskAccountNumber(p.accountNumber),
    phoneNumber: maskPhoneNumber(p.phoneNumber),
    entityName: maskEntityName(p.entityName),
    bankName: p.bankName,
    threatLevel: p.threatLevel,
    totalReports: p.totalReports,
    verifiedReports: p.verifiedReports,
  }))

  return c.json({
    query: q,
    found: data.length > 0,
    count: data.length,
    results: data,
  })
})

// ─── API Key Management (JWT required) ───────────────────────────

/**
 * POST /api/developer/keys — Generate new API key
 */
developer.post('/keys', authMiddleware, zValidator('json', createApiKeySchema), async (c) => {
  const user = c.get('user') as JwtPayload
  const { label } = c.req.valid('json')

  const { rawKey, keyHash } = generateApiKey()

  const [key] = await db.insert(apiKeys).values({
    userId: user.userId,
    keyHash,
    label,
  }).returning({
    id: apiKeys.id,
    label: apiKeys.label,
    rateLimitPerMin: apiKeys.rateLimitPerMin,
    createdAt: apiKeys.createdAt,
  })

  return c.json({
    message: 'API key berhasil dibuat. Simpan key ini — tidak bisa dilihat lagi.',
    key: rawKey,
    meta: key,
  }, 201)
})

/**
 * GET /api/developer/keys — List user's API keys
 */
developer.get('/keys', authMiddleware, async (c) => {
  const user = c.get('user') as JwtPayload

  const keys = await db
    .select({
      id: apiKeys.id,
      label: apiKeys.label,
      rateLimitPerMin: apiKeys.rateLimitPerMin,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.userId))
    .orderBy(desc(apiKeys.createdAt))

  return c.json({ keys })
})

/**
 * DELETE /api/developer/keys/:id — Revoke API key
 */
developer.delete('/keys/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')!
  const user = c.get('user') as JwtPayload

  const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1)

  if (!key) {
    return c.json({ error: 'API key tidak ditemukan' }, 404)
  }

  if (key.userId !== user.userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id))

  return c.json({ message: 'API key berhasil dinonaktifkan' })
})

export { v1 as developerApiV1 }
export default developer
