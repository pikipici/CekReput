import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc, sql, ilike, or, and, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/index.js'
import { reports, perpetrators, users, apiKeys, clarifications, evidenceFiles } from '../db/schema.js'
import { moderateReportSchema, paginationSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'
import type { JwtPayload } from '../middleware/auth.js'

const moderation = new Hono()

// All moderation routes require auth + admin
moderation.use('/*', authMiddleware, adminMiddleware)

// ─── Get Pending Reports ─────────────────────────────────────────

moderation.get('/pending', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, 'pending'))
  const total = Number(countResult?.count ?? 0)

  const pendingReports = await db
    .select()
    .from(reports)
    .where(eq(reports.status, 'pending'))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  // Fetch related data (perpetrators and evidence files) for these reports
  const reportIds = pendingReports.map(r => r.id)
  const perpIds = [...new Set(pendingReports.map(r => r.perpetratorId))]

  let perpetratorsMap: Record<string, typeof perpetrators.$inferSelect> = {}
  let evidenceMap: Record<string, typeof evidenceFiles.$inferSelect[]> = {}

  if (reportIds.length > 0) {
    const perps = await db.select().from(perpetrators).where(inArray(perpetrators.id, perpIds))
    perps.forEach(p => perpetratorsMap[p.id] = p)

    const { evidenceFiles } = await import('../db/schema.js')
    const evFiles = await db.select().from(evidenceFiles).where(inArray(evidenceFiles.reportId, reportIds))
    evFiles.forEach(f => {
      if (!evidenceMap[f.reportId]) evidenceMap[f.reportId] = []
      evidenceMap[f.reportId].push(f)
    })
  }

  // Combine data
  const enrichedReports = pendingReports.map(report => ({
    ...report,
    perpetrator: perpetratorsMap[report.perpetratorId] || null,
    evidenceFiles: evidenceMap[report.id] || []
  }))

  return c.json({ reports: enrichedReports, page, limit, total })
})

// ─── Moderate Report (Verify/Reject) ─────────────────────────────

moderation.patch(
  '/reports/:id',
  zValidator('json', moderateReportSchema),
  async (c) => {
    const id = c.req.param('id')
    const user = c.get('user') as JwtPayload
    const { action, rejectionReason, evidenceFiles } = c.req.valid('json')

    const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1)

    if (!report) {
      return c.json({ error: 'Laporan tidak ditemukan' }, 404)
    }

    if (report.status !== 'pending') {
      return c.json({ error: 'Laporan ini sudah dimoderasi' }, 400)
    }

    const newStatus = action === 'verify' ? 'verified' as const : 'rejected' as const

    // Update report status
    const [updated] = await db
      .update(reports)
      .set({
        status: newStatus,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        moderatedBy: user.userId,
        moderatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning()

    // If verified, recalculate perpetrator's threat level
    if (action === 'verify') {
      // Replace evidence if uploaded
      if (evidenceFiles && evidenceFiles.length > 0) {
        const { evidenceFiles: dbEvidenceFiles } = await import('../db/schema.js')
        // Delete old evidence
        await db.delete(dbEvidenceFiles).where(eq(dbEvidenceFiles.reportId, id))
        // Insert new evidence
        await db.insert(dbEvidenceFiles).values(
          evidenceFiles.map(file => ({
            reportId: id,
            fileUrl: file.url,
            fileName: file.name,
            mimeType: file.mimeType,
            fileSizeBytes: file.sizeBytes
          }))
        )
      }


      await recalculateThreatLevel(report.perpetratorId)
      
      // GAMIFICATION: Increase reporter's reputation and assign badges
      const [reporter] = await db.select().from(users).where(eq(users.id, report.reporterId)).limit(1)
      if (reporter) {
        const newScore = reporter.reputationScore + 10
        let newBadges = [...(reporter.badges || [])]
        
        // Example badge logic:
        if (newScore >= 50 && !newBadges.includes('Spam Hunter')) {
          newBadges.push('Spam Hunter')
        }
        if (newScore >= 200 && !newBadges.includes('Elite Tracker')) {
          newBadges.push('Elite Tracker')
        }
        if (newScore >= 500 && !newBadges.includes('Verify Master')) {
          newBadges.push('Verify Master')
        }
        
        await db.update(users).set({
          reputationScore: newScore,
          badges: newBadges.length > 0 ? newBadges : null
        }).where(eq(users.id, reporter.id))
      }
    }

    return c.json({
      message: action === 'verify'
        ? 'Laporan berhasil diverifikasi'
        : 'Laporan ditolak',
      report: updated,
    })
  }
)

// ─── Get Perpetrator's Reports (Admin) ──────────────────────────

const perpReportsQuerySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional()
})

moderation.get('/perpetrators/:id/reports', zValidator('query', perpReportsQuerySchema), async (c) => {
  const id = c.req.param('id')
  const { status } = c.req.valid('query')

  const conditions = [eq(reports.perpetratorId, id)]
  if (status) conditions.push(eq(reports.status, status))

  const perpReports = await db
    .select({
      id: reports.id,
      category: reports.category,
      incidentDate: reports.incidentDate,
      createdAt: reports.createdAt,
      lossAmount: reports.lossAmount,
      reporterName: users.name,
      status: reports.status,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .where(and(...conditions))
    .orderBy(desc(reports.createdAt))

  return c.json({ reports: perpReports })
})

// ─── Moderation Stats ────────────────────────────────────────────

moderation.get('/stats', async (c) => {
  const [stats] = await db.select({
    pending: sql<number>`count(*) filter (where ${reports.status} = 'pending')`,
    verified: sql<number>`count(*) filter (where ${reports.status} = 'verified')`,
    rejected: sql<number>`count(*) filter (where ${reports.status} = 'rejected')`,
    total: sql<number>`count(*)`,
  }).from(reports)

  const [clarificationStats] = await db.select({
    pending: sql<number>`count(*) filter (where ${clarifications.status} = 'pending')`
  }).from(clarifications)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29) // 29 to include today as the 30th day
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const trendsRaw = await db
    .select({
      date: sql<string>`to_char(${reports.createdAt} at time zone 'Asia/Jakarta', 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`
    })
    .from(reports)
    .where(sql`${reports.createdAt} >= ${thirtyDaysAgo.toISOString()}`)
    .groupBy(sql`to_char(${reports.createdAt} at time zone 'Asia/Jakarta', 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${reports.createdAt} at time zone 'Asia/Jakarta', 'YYYY-MM-DD')`)

  const trendsMap = new Map(trendsRaw.map(t => [t.date, t.count]))
  const trends = []

  // Fill all 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) // YYYY-MM-DD
    trends.push({
      date: dateStr,
      count: trendsMap.get(dateStr) || 0
    })
  }

  return c.json({ 
    stats: {
      ...stats,
      pendingClarifications: Number(clarificationStats?.pending ?? 0)
    }, 
    trends 
  })
})

// ─── Proxy Evidences Download ──────────────────────────────────────

/**
 * Checks if an IP address is private/internal
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const ipv4Patterns = [
    /^10\./,                          // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,                    // 192.168.0.0/16
    /^127\./,                         // 127.0.0.0/8 (loopback)
    /^0\./,                           // 0.0.0.0/8
    /^169\.254\./,                    // 169.254.0.0/16 (link-local)
  ]
  
  // IPv6 private patterns
  const ipv6Patterns = [
    /^fe80:/i,                        // Link-local
    /^fc00:/i,                        // Unique local
    /^fd00:/i,                        // Unique local
    /^::1$/,                          // Loopback
    /^::ffff:/i,                      // IPv4-mapped
  ]
  
  return ipv4Patterns.some(p => p.test(ip)) || ipv6Patterns.some(p => p.test(ip))
}

/**
 * Validates and fetches a URL with SSRF protection
 * Only allows HTTPS URLs to public hosts
 */
async function safeFetchUrl(url: string): Promise<Response> {
  if (!url) {
    throw new Error('URL is required')
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('Invalid URL format')
  }

  // Only allow HTTPS
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed')
  }

  // Block private/internal IP addresses
  const hostname = parsedUrl.hostname
  if (isPrivateIP(hostname)) {
    throw new Error('Access to internal/private hosts is not allowed')
  }

  // Block localhost and common internal hostnames
  const blockedHosts = [
    'localhost',
    'internal',
    'metadata',
    'metadata.google.internal',
    '169.254.169.254', // Cloud metadata service
  ]
  if (blockedHosts.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
    throw new Error('Access to internal hosts is not allowed')
  }

  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'CekReput-Evidence-Downloader/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  return response
}

moderation.get('/evidence/download', async (c) => {
  const url = c.req.query('url')
  
  try {
    const response = await safeFetchUrl(url!)
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const urlObj = new URL(url!)
    const filename = urlObj.pathname.split('/').pop() || 'downloaded-file'

    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch(error) {
    console.error('Download Proxy Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to proxy download'
    return c.json({ error: errorMessage }, error instanceof Error && errorMessage.includes('not allowed') ? 403 : 500)
  }
})

// ─── List All Perpetrators (Admin) ───────────────────────────────

const perpetratorQuerySchema = z.object({
  q: z.string().optional(),
  level: z.enum(['safe', 'warning', 'danger']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

moderation.get('/perpetrators', zValidator('query', perpetratorQuerySchema), async (c) => {
  const { q, level, page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  // Build where conditions
  const conditions = []
  if (level) conditions.push(eq(perpetrators.threatLevel, level))
  if (q) {
    conditions.push(
      or(
        ilike(perpetrators.accountNumber ?? '', `%${q}%`),
        ilike(perpetrators.phoneNumber ?? '', `%${q}%`),
        ilike(perpetrators.entityName ?? '', `%${q}%`),
        ilike(perpetrators.bankName ?? '', `%${q}%`),
        ilike(perpetrators.socialMedia ?? '', `%${q}%`)
      )!
    )
  }

  // Count total
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(perpetrators).$dynamic()
  for (const cond of conditions) countQuery = countQuery.where(cond)
  const [countResult] = await countQuery
  const total = Number(countResult?.count ?? 0)

  // Fetch page
  let query = db
    .select()
    .from(perpetrators)
    .orderBy(desc(perpetrators.createdAt))
    .limit(limit)
    .offset(offset)
    .$dynamic()
  for (const cond of conditions) query = query.where(cond)
  const result = await query

  return c.json({ perpetrators: result, page, limit, total })
})

// ─── List Users ──────────────────────────────────────────────────

const userQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

moderation.get('/users', zValidator('query', userQuerySchema), async (c) => {
  const { q, role, page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  // Build conditions
  const conditions = []
  if (role) conditions.push(eq(users.role, role))
  if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))!)

  // Count total
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(users).$dynamic()
  for (const cond of conditions) countQuery = countQuery.where(cond)
  const [countResult] = await countQuery
  const total = Number(countResult?.count ?? 0)

  // Fetch page
  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)
    .$dynamic()
  for (const cond of conditions) query = query.where(cond)
  const result = await query

  return c.json({ users: result, page, limit, total })
})

// ─── Change User Role ────────────────────────────────────────────

const changeRoleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
})

moderation.patch(
  '/users/:id/role',
  zValidator('json', changeRoleSchema),
  async (c) => {
    const id = c.req.param('id')
    const currentUser = c.get('user') as JwtPayload
    const { role } = c.req.valid('json')

    // Cannot change own role
    if (id === currentUser.userId) {
      return c.json({ error: 'Tidak bisa mengubah role sendiri' }, 400)
    }

    // Only admin can promote to admin (strict)
    if (role === 'admin' && currentUser.role !== 'admin') {
      return c.json({ error: 'Hanya admin yang bisa mempromosikan ke admin' }, 403)
    }

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({ id: users.id, name: users.name, role: users.role })

    if (!updated) {
      return c.json({ error: 'User tidak ditemukan' }, 404)
    }

    return c.json({ message: 'Role berhasil diubah', user: updated })
  }
)

// ─── List API Keys ───────────────────────────────────────────────

moderation.get('/api-keys', async (c) => {
  const keys = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      name: apiKeys.label,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt))

  return c.json({ keys })
})

/**
 * Recalculate a perpetrator's threat level based on verified reports.
 * 0 verified = safe, 1-2 = warning, 3+ = danger
 */
async function recalculateThreatLevel(perpetratorId: string) {
  const [result] = await db
    .select({
      verifiedCount: sql<number>`count(*) filter (where ${reports.status} = 'verified')`,
    })
    .from(reports)
    .where(eq(reports.perpetratorId, perpetratorId))

  const count = Number(result?.verifiedCount ?? 0)
  let threatLevel: 'safe' | 'warning' | 'danger'

  if (count === 0) threatLevel = 'safe'
  else if (count <= 2) threatLevel = 'warning'
  else threatLevel = 'danger'

  await db
    .update(perpetrators)
    .set({
      threatLevel,
      verifiedReports: count,
    })
    .where(eq(perpetrators.id, perpetratorId))
}

export default moderation
