import type { Context, Next } from 'hono'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// In-memory store (swap to Redis in production)
const store = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Rate limiting middleware factory.
 * Uses IP-based limiting with in-memory store.
 */
export function rateLimiter(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
    const routeKey = c.req.path
    const key = `${ip}:${routeKey}`
    const now = Date.now()

    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      // New window
      store.set(key, { count: 1, resetAt: now + config.windowMs })
      c.header('X-RateLimit-Limit', config.maxRequests.toString())
      c.header('X-RateLimit-Remaining', (config.maxRequests - 1).toString())
      await next()
      return
    }

    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header('Retry-After', retryAfter.toString())
      c.header('X-RateLimit-Limit', config.maxRequests.toString())
      c.header('X-RateLimit-Remaining', '0')
      return c.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${retryAfter} detik.` },
        429
      )
    }

    entry.count++
    c.header('X-RateLimit-Limit', config.maxRequests.toString())
    c.header('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
    await next()
  }
}

// Pre-configured rate limiters
export const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10 })
export const checkRateLimit = rateLimiter({ windowMs: 60 * 1000, maxRequests: 30 })
export const reportRateLimit = rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 5 })
export const commentRateLimit = rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 20 })
export const apiRateLimit = rateLimiter({ windowMs: 60 * 1000, maxRequests: 60 })
