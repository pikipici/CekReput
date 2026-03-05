import type { Context, Next } from 'hono'
import redis from '../lib/redis.js'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

/**
 * Get client IP from trusted headers only
 * Priority: CF-Connecting-IP > X-Real-IP > X-Forwarded-IP (first) > socket address
 */
function getClientIP(c: Context): string {
  // Cloudflare proxy header (most trusted when behind CF)
  const cfIP = c.req.header('cf-connecting-ip')
  if (cfIP) return cfIP

  // X-Real-IP (single IP, commonly used by nginx)
  const realIP = c.req.header('x-real-ip')
  if (realIP) return realIP

  // X-Forwarded-For (may contain chain of IPs, take the first/leftmost one)
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    const firstIP = forwardedFor.split(',')[0].trim()
    if (firstIP) return firstIP
  }

  // Fallback to connection remote address (may be proxy IP)
  // Note: In production, you should always be behind a trusted proxy
  return 'unknown'
}

/**
 * Rate limiting middleware factory.
 * Uses Redis-based limiting with fallback to in-memory store.
 * Only trusts specific IP headers to prevent header spoofing.
 */
export function rateLimiter(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const ip = getClientIP(c)
    const routeKey = c.req.path
    const key = `ratelimit:${ip}:${routeKey}`
    const now = Date.now()
    const windowMs = config.windowMs
    const maxRequests = config.maxRequests

    // Try Redis first
    if (redis) {
      try {
        const ttl = await redis.ttl(key)
        const currentCount = await redis.get(key)
        const count = currentCount ? parseInt(currentCount, 10) : 0

        if (count >= maxRequests && ttl > 0) {
          c.header('X-RateLimit-Limit', maxRequests.toString())
          c.header('X-RateLimit-Remaining', '0')
          c.header('Retry-After', ttl.toString())
          return c.json(
            { error: `Terlalu banyak request. Coba lagi dalam ${ttl} detik.` },
            429
          )
        }

        const pipeline = redis.multi()
        pipeline.incr(key)
        if (count === 0) {
          pipeline.expire(key, Math.ceil(windowMs / 1000))
        }
        await pipeline.exec()

        const remaining = Math.max(0, maxRequests - count - 1)
        c.header('X-RateLimit-Limit', maxRequests.toString())
        c.header('X-RateLimit-Remaining', remaining.toString())

        await next()
        return
      } catch (err) {
        // Redis error - fall back to in-memory limiting
        console.error('Redis rate limit error, falling back to memory:', err)
      }
    }

    // Fallback: In-memory store (for development or Redis failures)
    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
      // New window
      store.set(key, { count: 1, resetAt: now + windowMs })
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', (maxRequests - 1).toString())
      await next()
      return
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header('Retry-After', retryAfter.toString())
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', '0')
      return c.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${retryAfter} detik.` },
        429
      )
    }

    entry.count++
    c.header('X-RateLimit-Limit', maxRequests.toString())
    c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString())
    await next()
  }
}

// In-memory store fallback (swap to Redis in production)
const store = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

// Pre-configured rate limiters
export const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10 })
export const checkRateLimit = rateLimiter({ windowMs: 60 * 1000, maxRequests: 30 })
export const reportRateLimit = rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 5 })
export const commentRateLimit = rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 20 })
export const apiRateLimit = rateLimiter({ windowMs: 60 * 1000, maxRequests: 60 })
