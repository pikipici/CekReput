import type { Context, Next } from 'hono'
import jwt, { type SignOptions } from 'jsonwebtoken'

// Import type augmentation for Hono context variables
import '../types/index.js'

export interface JwtPayload {
  userId: string
  email: string
  role: 'user' | 'moderator' | 'admin'
}

// Validate JWT secrets in production - fail fast if not configured
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_ACCESS_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_ACCESS_SECRET environment variable is required in production')
}
if (!JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_REFRESH_SECRET environment variable is required in production')
}

// Fallback for development only
const DEV_ACCESS_SECRET = 'dev-access-secret-cekreput-2024'
const DEV_REFRESH_SECRET = 'dev-refresh-secret-cekreput-2024'

const getAccessSecret = () => JWT_ACCESS_SECRET || DEV_ACCESS_SECRET
const getRefreshSecret = () => JWT_REFRESH_SECRET || DEV_REFRESH_SECRET

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
    const payload = jwt.verify(token, getAccessSecret()) as JwtPayload
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
      const payload = jwt.verify(token, getAccessSecret()) as JwtPayload
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
  const accessToken = jwt.sign(tokenPayload, getAccessSecret(), {
    expiresIn: accessExpiresIn,
  } satisfies SignOptions)

  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as string & jwt.SignOptions['expiresIn']
  const refreshToken = jwt.sign(tokenPayload, getRefreshSecret(), {
    expiresIn: refreshExpiresIn,
  } satisfies SignOptions)

  return { accessToken, refreshToken }
}

/**
 * Verify a refresh token and return the payload.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, getRefreshSecret()) as JwtPayload
}
