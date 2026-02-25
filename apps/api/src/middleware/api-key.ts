import type { Context, Next } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { apiKeys } from '../db/schema.js'
import crypto from 'crypto'

/**
 * API key authentication middleware for the developer API.
 * Expects header: `X-API-Key: <key>`
 */
export async function apiKeyMiddleware(c: Context, next: Next) {
  const rawKey = c.req.header('X-API-Key')

  if (!rawKey) {
    return c.json({
      error: 'API key required. Pass via X-API-Key header.',
      docs: '/api-docs',
    }, 401)
  }

  // Hash the key to compare with stored hash
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  try {
    const [key] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1)

    if (!key) {
      return c.json({ error: 'API key tidak valid' }, 401)
    }

    if (!key.isActive) {
      return c.json({ error: 'API key sudah dinonaktifkan' }, 403)
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id))

    // Set key info for downstream handlers
    c.set('apiKey', key)
    await next()
  } catch {
    return c.json({ error: 'Internal server error during API key validation' }, 500)
  }
}

/**
 * Generate a new API key (raw key + hash for storage).
 */
export function generateApiKey(): { rawKey: string; keyHash: string } {
  const rawKey = `crp_${crypto.randomBytes(32).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  return { rawKey, keyHash }
}
