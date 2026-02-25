import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc, sql, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/index.js'
import { reports, perpetrators, users, apiKeys } from '../db/schema.js'
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

  const pending = await db
    .select()
    .from(reports)
    .where(eq(reports.status, 'pending'))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ reports: pending, page, limit, total })
})

// ─── Moderate Report (Verify/Reject) ─────────────────────────────

moderation.patch(
  '/reports/:id',
  zValidator('json', moderateReportSchema),
  async (c) => {
    const id = c.req.param('id')
    const user = c.get('user') as JwtPayload
    const { action, rejectionReason } = c.req.valid('json')

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
      await recalculateThreatLevel(report.perpetratorId)
    }

    return c.json({
      message: action === 'verify'
        ? 'Laporan berhasil diverifikasi'
        : 'Laporan ditolak',
      report: updated,
    })
  }
)

// ─── Moderation Stats ────────────────────────────────────────────

moderation.get('/stats', async (c) => {
  const [stats] = await db.select({
    pending: sql<number>`count(*) filter (where ${reports.status} = 'pending')`,
    verified: sql<number>`count(*) filter (where ${reports.status} = 'verified')`,
    rejected: sql<number>`count(*) filter (where ${reports.status} = 'rejected')`,
    total: sql<number>`count(*)`,
  }).from(reports)

  return c.json({ stats })
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
