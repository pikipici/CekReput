import type { Context, Next } from 'hono'
import jwt, { type SignOptions } from 'jsonwebtoken'

// Import type augmentation for Hono context variables
import '../types/index.js'

export interface JwtPayload {
  userId: string
  email: string
  role: 'user' | 'moderator' | 'admin'
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-cekreput-2024'

/**
 * JWT authentication middleware.
 * Sets `c.set('user', payload)` on success.
 */
export async function authMiddleware(c: Context, next: Next) {
  // Pass through CORS preflight requests
  if (c.req.method === 'OPTIONS') {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized — token tidak ditemukan' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized — token tidak valid atau sudah expired' }, 401)
  }
}

/**
 * Optional auth — doesn't block the request, just sets user if token exists.
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      const payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload
      c.set('user', payload)
    } catch {
      // Token invalid, continue without user
    }
  }
  await next()
}

/**
 * Generate access and refresh tokens for a user.
 */
export function generateTokens(payload: JwtPayload) {
  const tokenPayload = { ...payload }
  const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as string & jwt.SignOptions['expiresIn']
  const accessToken = jwt.sign(tokenPayload, JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  } satisfies SignOptions)

  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-cekreput-2024'
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as string & jwt.SignOptions['expiresIn']
  const refreshToken = jwt.sign(tokenPayload, refreshSecret, {
    expiresIn: refreshExpiresIn,
  } satisfies SignOptions)

  return { accessToken, refreshToken }
}

/**
 * Verify a refresh token and return the payload.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-cekreput-2024'
  return jwt.verify(token, refreshSecret) as JwtPayload
}
