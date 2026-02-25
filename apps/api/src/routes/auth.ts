import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { registerSchema, loginSchema } from '../utils/validators.js'
import { generateTokens, verifyRefreshToken, authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { authRateLimit } from '../middleware/rate-limit.js'

const auth = new Hono()

// Rate limit all auth routes
auth.use('/*', authRateLimit)

// ─── Register ────────────────────────────────────────────────────

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  // Check if email already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return c.json({ error: 'Email sudah terdaftar' }, 409)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create user
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role })

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    message: 'Registrasi berhasil',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  }, 201)
})

// ─── Login ───────────────────────────────────────────────────────

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !user.passwordHash) {
    return c.json({ error: 'Email atau kata sandi salah' }, 401)
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return c.json({ error: 'Email atau kata sandi salah' }, 401)
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    ...tokens,
  })
})

// ─── Google OAuth ────────────────────────────────────────────────

auth.post('/google', async (c) => {
  const { idToken } = await c.req.json()

  // Verify Google ID token
  const googleApiUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  const response = await fetch(googleApiUrl)

  if (!response.ok) {
    return c.json({ error: 'Google token tidak valid' }, 401)
  }

  const googleUser = (await response.json()) as {
    sub: string
    email: string
    name: string
    picture: string
  }

  // Find or create user
  let [user] = await db.select().from(users).where(eq(users.googleId, googleUser.sub)).limit(1)

  if (!user) {
    // Check if email already exists (link account)
    [user] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1)

    if (user) {
      // Link Google ID to existing account
      await db.update(users).set({
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture,
        updatedAt: new Date(),
      }).where(eq(users.id, user.id))
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture,
      }).returning()
      user = newUser
    }
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    ...tokens,
  })
})

// ─── Refresh Token ───────────────────────────────────────────────

auth.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json()

  if (!refreshToken) {
    return c.json({ error: 'Refresh token required' }, 400)
  }

  try {
    const payload = verifyRefreshToken(refreshToken)
    // Re-fetch user to get latest role
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const newPayload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
    const tokens = generateTokens(newPayload)

    return c.json(tokens)
  } catch {
    return c.json({ error: 'Refresh token tidak valid atau sudah expired' }, 401)
  }
})

// ─── Get Current User ────────────────────────────────────────────

auth.get('/me', authMiddleware, async (c) => {
  const jwtUser = c.get('user') as JwtPayload

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, jwtUser.userId))
    .limit(1)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

export default auth
