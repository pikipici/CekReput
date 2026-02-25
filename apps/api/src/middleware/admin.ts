import type { Context, Next } from 'hono'
import type { JwtPayload } from './auth.js'

/**
 * Admin role guard middleware.
 * Must be used AFTER authMiddleware.
 * Allows 'admin' and 'moderator' roles.
 */
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user') as JwtPayload | undefined

  if (!user) {
    return c.json({ error: 'Unauthorized — login required' }, 401)
  }

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ error: 'Forbidden — admin atau moderator access required' }, 403)
  }

  await next()
}

/**
 * Strict admin-only guard (excludes moderator).
 */
export async function strictAdminMiddleware(c: Context, next: Next) {
  const user = c.get('user') as JwtPayload | undefined

  if (!user) {
    return c.json({ error: 'Unauthorized — login required' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Forbidden — admin-only access' }, 403)
  }

  await next()
}
