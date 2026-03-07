import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, otpCodes } from '../db/schema.js'
import { registerSchema, loginSchema, googleRegisterSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators.js'
import { sendVerificationEmail } from '../utils/mailer.js'
import { generateTokens, verifyRefreshToken, authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { authRateLimit } from '../middleware/rate-limit.js'

const auth = new Hono()

// Rate limit all auth routes
auth.use('/*', authRateLimit)

// ─── Register ────────────────────────────────────────────────────

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  let user
  
  // Check if email already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    if (existing.emailVerified) {
      return c.json({ error: 'Email sudah terdaftar' }, 409)
    } else {
      // User exists but unverified. Let's update their name/password and resend OTP
      const [updatedUser] = await db
        .update(users)
        .set({ name, passwordHash })
        .where(eq(users.id, existing.id))
        .returning({ id: users.id, name: users.name, email: users.email, role: users.role, badges: users.badges })
      user = updatedUser
    }
  } else {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash, emailVerified: false })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, badges: users.badges })
    user = newUser
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Upsert OTP (delete older ones for this email first, or just insert)
  await db.delete(otpCodes).where(eq(otpCodes.email, email))
  await db.insert(otpCodes).values({
    email,
    code: otpCode,
    expiresAt,
  })

  // Send Email (running in background so UI feels responsive without waiting for SMTP)
  sendVerificationEmail(email, otpCode).catch(console.error)

  return c.json({
    message: 'OTP telah dikirim ke email Anda. Silakan periksa kotak masuk.',
    email: user.email,
    requiresOtp: true,
  }, 201)
})

// ─── Verify Email ────────────────────────────────────────────────

auth.post('/verify-email', zValidator('json', verifyOtpSchema), async (c) => {
  const { email, code } = c.req.valid('json')

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) {
    return c.json({ error: 'Pengguna tidak ditemukan' }, 404)
  }

  if (user.emailVerified) {
    return c.json({ error: 'Email sudah diverifikasi' }, 400)
  }

  // Find OTP
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), eq(otpCodes.code, code), gt(otpCodes.expiresAt, new Date())))
    .limit(1)

  if (!otp) {
    return c.json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa' }, 400)
  }

  // Mark as verified
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id))
  await db.delete(otpCodes).where(eq(otpCodes.email, email))

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    message: 'Email berhasil diverifikasi',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, badges: user.badges },
    ...tokens,
  })
})

// ─── Resend OTP ──────────────────────────────────────────────────

auth.post('/resend-otp', zValidator('json', resendOtpSchema), async (c) => {
  const { email } = c.req.valid('json')

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || user.emailVerified) {
    // Avoid info leakage: always return a neutral realistic success even if already verified
    return c.json({ message: 'Jika email terdaftar dan belum diverifikasi, OTP baru telah dikirim.' })
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db.delete(otpCodes).where(eq(otpCodes.email, email))
  await db.insert(otpCodes).values({
    email,
    code: otpCode,
    expiresAt,
  })

  // Send email in background
  sendVerificationEmail(email, otpCode).catch(console.error)

  return c.json({ message: 'OTP baru telah dikirim ke email Anda.' })
})

// ─── Forgot Password ───────────────────────────────────────────────

auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  
  // Always return success even if user not found to prevent email enumeration attacks
  if (!user || (!user.passwordHash && user.googleId)) {
    // If no user, or user only uses Google login without password
    return c.json({ message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.' })
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db.delete(otpCodes).where(eq(otpCodes.email, email))
  await db.insert(otpCodes).values({
    email,
    code: otpCode,
    expiresAt,
  })

  // Send email in background
  sendVerificationEmail(email, otpCode, 'forgot-password').catch(console.error)

  return c.json({ message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.' })
})

// ─── Reset Password ────────────────────────────────────────────────

auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { email, code, newPassword } = c.req.valid('json')

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) {
    return c.json({ error: 'Permintaan tidak valid' }, 400)
  }

  // Find OTP
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.email, email), eq(otpCodes.code, code), gt(otpCodes.expiresAt, new Date())))
    .limit(1)

  if (!otp) {
    return c.json({ error: 'Kode OTP tidak valid atau sudah kedaluwarsa' }, 400)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12)

  // Update password and mark as verified if they weren't before (since email is proven)
  await db.update(users).set({ 
    passwordHash,
    emailVerified: true
  }).where(eq(users.id, user.id))
  
  // Cleanup OTP
  await db.delete(otpCodes).where(eq(otpCodes.email, email))

  // Auto login them with new token
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    message: 'Kata sandi berhasil direset',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, badges: user.badges },
    ...tokens,
  })
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

  // Check verification
  if (!user.emailVerified && user.role !== 'admin') {
    return c.json({ error: 'Email belum diverifikasi', requiresOtp: true }, 403)
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, badges: user.badges },
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
    aud: string
    iss: string
  }

  // Validate token issuer
  if (googleUser.iss !== 'accounts.google.com' && googleUser.iss !== 'https://accounts.google.com') {
    console.error('[Google OAuth] Invalid issuer:', googleUser.iss)
    return c.json({ error: 'Google token issuer tidak valid' }, 401)
  }

  // Validate audience (client_id) - critical security check
  const expectedAudience = process.env.GOOGLE_CLIENT_ID
  if (expectedAudience && googleUser.aud !== expectedAudience) {
    console.error('[Google OAuth] Audience mismatch. Expected:', expectedAudience, 'Got:', googleUser.aud)
    return c.json({ error: 'Google token audience tidak cocok - kemungkinan token bukan untuk aplikasi ini' }, 401)
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
      // User doesn't exist at all, force registration
      return c.json({
        requiresRegistration: true,
        message: 'Email belum terdaftar. Selesaikan pendaftaran akun Anda.',
        googleData: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          avatarUrl: googleUser.picture,
        }
      }, 200)
    }
  }

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, badges: user.badges },
    ...tokens,
  })
})

// ─── Google Register ─────────────────────────────────────────────

auth.post('/google-register', zValidator('json', googleRegisterSchema), async (c) => {
  const { name, email, password, googleId, avatarUrl } = c.req.valid('json')

  // Check if email already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return c.json({ error: 'Email sudah terdaftar. Silakan login langsung.' }, 409)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Create new user linked to Google
  const [user] = await db.insert(users).values({
    name,
    email,
    passwordHash,
    googleId,
    avatarUrl,
  }).returning()

  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role }
  const tokens = generateTokens(payload)

  return c.json({
    message: 'Registrasi berhasil',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, badges: user.badges },
    ...tokens,
  }, 201)
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
      badges: users.badges,
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
