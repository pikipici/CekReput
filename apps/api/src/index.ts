import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { sql, desc, gte } from 'drizzle-orm'
import { db } from './db/index.js'
import { reports, perpetrators } from './db/schema.js'

// Route imports
import auth from './routes/auth.js'
import check from './routes/check.js'
import reportsRouter from './routes/reports.js'
import perpetratorsRouter from './routes/perpetrators.js'
import commentsRouter from './routes/comments.js'
import moderation from './routes/moderation.js'
import clarificationsRouter from './routes/clarification.js'
import developer, { developerApiV1 } from './routes/developer.js'
import upload from './routes/upload.js'

const app = new Hono()

// ─── Global Middleware ───────────────────────────────────────────

// Logging
app.use('*', logger())

// CORS — allow frontend dev server
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
    maxAge: 86400,
  })
)

// ─── Health Check ────────────────────────────────────────────────

app.get('/', (c) => {
  return c.json({
    name: 'CekReput API',
    version: '0.1.0',
    status: 'running',
    docs: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      check: '/api/check',
      reports: '/api/reports',
      perpetrators: '/api/perpetrators',
      comments: '/api/comments',
      moderation: '/api/moderation',
      clarifications: '/api/clarifications',
      developer: '/api/developer',
      upload: '/api/upload',
      publicApi: '/api/v1',
    },
  })
})

// ─── Route Registration ─────────────────────────────────────────

// Public stats (no auth)
app.get('/api/stats', async (c) => {
  const [reportStats] = await db.select({ total: sql<number>`count(*)` }).from(reports)
  const [perpStats] = await db.select({
    verified: sql<number>`count(*) filter (where ${perpetrators.threatLevel} in ('danger', 'warning'))`,
    total: sql<number>`count(*)`,
  }).from(perpetrators)

  return c.json({
    totalReports: Number(reportStats?.total ?? 0),
    verifiedPerpetrators: Number(perpStats?.verified ?? 0),
    totalChecks: Number(perpStats?.total ?? 0),
  })
})

// Recent reports for live ticker (max 2 days ago, no auth)
app.get('/api/reports/recent', async (c) => {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const recent = await db
    .select({
      id: reports.id,
      category: reports.category,
      createdAt: reports.createdAt,
      accountType: perpetrators.accountType,
      bankName: perpetrators.bankName,
      phoneNumber: perpetrators.phoneNumber,
      accountNumber: perpetrators.accountNumber,
      entityName: perpetrators.entityName,
    })
    .from(reports)
    .innerJoin(perpetrators, sql`${reports.perpetratorId} = ${perpetrators.id}`)
    .where(gte(reports.createdAt, twoDaysAgo))
    .orderBy(desc(reports.createdAt))
    .limit(20)

  // Mask identities
  const masked = recent.map((r) => {
    let identity = ''
    let icon = 'person'
    if (r.accountNumber) {
      const num = r.accountNumber
      identity = `${r.bankName ?? 'Bank'} ${num.slice(0, 4)}${'*'.repeat(Math.max(0, num.length - 7))}${num.slice(-3)}`
      icon = 'account_balance'
    } else if (r.phoneNumber) {
      const ph = r.phoneNumber.replace(/\D/g, '')
      identity = `${ph.slice(0, 4)}-${ph.slice(4, 6)}**-****`
      icon = 'smartphone'
    } else if (r.entityName) {
      identity = r.entityName
      icon = 'storefront'
    }
    return {
      id: r.id,
      category: r.category,
      identity,
      icon,
      createdAt: r.createdAt,
    }
  })

  return c.json({ reports: masked })
})

app.route('/api/auth', auth)
app.route('/api/check', check)
app.route('/api/reports', reportsRouter)
app.route('/api/perpetrators', perpetratorsRouter)
app.route('/api/comments', commentsRouter)
app.route('/api/moderation', moderation)
app.route('/api/clarifications', clarificationsRouter)
app.route('/api/developer', developer)
app.route('/api/upload', upload)
app.route('/api/v1', developerApiV1)

// ─── API Documentation Endpoint ─────────────────────────────────

app.get('/api-docs', (c) => {
  return c.json({
    title: 'CekReput API Documentation',
    version: '0.1.0',
    description: 'Crowdsourced Scam Database API',
    baseUrl: '/api',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', auth: 'none', description: 'Daftar akun baru' },
      { method: 'POST', path: '/api/auth/login', auth: 'none', description: 'Login' },
      { method: 'POST', path: '/api/auth/google', auth: 'none', description: 'Google OAuth login' },
      { method: 'POST', path: '/api/auth/refresh', auth: 'JWT', description: 'Refresh access token' },
      { method: 'GET', path: '/api/auth/me', auth: 'JWT', description: 'Get current user' },
      { method: 'GET', path: '/api/check?q=...', auth: 'none', description: 'Search scam database' },
      { method: 'GET', path: '/api/perpetrators/:id', auth: 'none', description: 'Detail pelaku' },
      { method: 'GET', path: '/api/perpetrators/:id/reports', auth: 'none', description: 'Laporan pelaku' },
      { method: 'GET', path: '/api/perpetrators/:id/comments', auth: 'none', description: 'Komentar komunitas' },
      { method: 'GET', path: '/api/perpetrators/:id/timeline', auth: 'none', description: 'Timeline data' },
      { method: 'POST', path: '/api/reports', auth: 'JWT', description: 'Buat laporan baru' },
      { method: 'GET', path: '/api/reports/my', auth: 'JWT', description: 'Laporan milik user' },
      { method: 'POST', path: '/api/comments', auth: 'JWT', description: 'Tulis komentar' },
      { method: 'POST', path: '/api/comments/:id/vote', auth: 'JWT', description: 'Vote komentar' },
      { method: 'POST', path: '/api/upload/evidence', auth: 'JWT', description: 'Upload bukti' },
      { method: 'POST', path: '/api/clarifications', auth: 'JWT', description: 'Ajukan klarifikasi' },
      { method: 'GET', path: '/api/moderation/pending', auth: 'Admin', description: 'Laporan pending' },
      { method: 'PATCH', path: '/api/moderation/reports/:id', auth: 'Admin', description: 'Moderasi laporan' },
      { method: 'POST', path: '/api/developer/keys', auth: 'JWT', description: 'Generate API key' },
      { method: 'GET', path: '/api/v1/check?q=...', auth: 'API Key', description: 'Public API check' },
    ],
  })
})

// ─── 404 Not Found ───────────────────────────────────────────────

app.notFound((c) => {
  return c.json({ error: 'Endpoint tidak ditemukan', docs: '/api-docs' }, 404)
})

// ─── Global Error Handler ────────────────────────────────────────

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack)
  return c.json({ error: 'Internal server error' }, 500)
})

// ─── Start Server ────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3001)

console.log(`
╔══════════════════════════════════════════╗
║         🛡️  CekReput API Server          ║
╠══════════════════════════════════════════╣
║  Port:    ${String(port).padEnd(30)}║
║  Docs:    http://localhost:${port}/api-docs${' '.repeat(Math.max(0, 7 - String(port).length))}║
║  Health:  http://localhost:${port}/${' '.repeat(Math.max(0, 14 - String(port).length))}║
╚══════════════════════════════════════════╝
`)

serve({ fetch: app.fetch, port })

export default app
