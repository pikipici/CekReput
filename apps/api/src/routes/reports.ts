import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { reports, perpetrators, evidenceFiles } from '../db/schema.js'
import { createReportSchema, paginationSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { reportRateLimit } from '../middleware/rate-limit.js'

const reportsRouter = new Hono()

// ─── Create Report ───────────────────────────────────────────────

reportsRouter.post(
  '/',
  authMiddleware,
  reportRateLimit,
  zValidator('json', createReportSchema),
  async (c) => {
    const user = c.get('user') as JwtPayload
    const data = c.req.valid('json')

    // Find or create perpetrator
    let perpetrator
    if (data.accountNumber) {
      const [existing] = await db
        .select()
        .from(perpetrators)
        .where(eq(perpetrators.accountNumber, data.accountNumber))
        .limit(1)
      perpetrator = existing
    }

    if (!perpetrator && data.phoneNumber) {
      const [existing] = await db
        .select()
        .from(perpetrators)
        .where(eq(perpetrators.phoneNumber, data.phoneNumber))
        .limit(1)
      perpetrator = existing
    }

    if (!perpetrator) {
      // Create new perpetrator
      const [newPerp] = await db.insert(perpetrators).values({
        accountNumber: data.accountNumber ?? null,
        phoneNumber: data.phoneNumber ?? null,
        entityName: data.entityName ?? null,
        bankName: data.bankName ?? null,
        accountType: data.accountType,
        firstReported: new Date(),
        lastReported: new Date(),
        totalReports: 1,
      }).returning()
      perpetrator = newPerp
    } else {
      // Update existing perpetrator
      await db.update(perpetrators).set({
        totalReports: perpetrator.totalReports + 1,
        lastReported: new Date(),
        // Update name/bank if provided and was null
        entityName: perpetrator.entityName ?? data.entityName ?? null,
        bankName: perpetrator.bankName ?? data.bankName ?? null,
      }).where(eq(perpetrators.id, perpetrator.id))
    }

    // Create report with status 'pending'
    const [report] = await db.insert(reports).values({
      perpetratorId: perpetrator.id,
      reporterId: user.userId,
      category: data.category,
      chronology: data.chronology,
      incidentDate: data.incidentDate,
      status: 'pending',
    }).returning()

    return c.json({
      message: 'Laporan berhasil dikirim. Akan direview oleh admin.',
      report: {
        id: report.id,
        perpetratorId: perpetrator.id,
        status: report.status,
        createdAt: report.createdAt,
      },
    }, 201)
  }
)

// ─── My Reports ──────────────────────────────────────────────────

reportsRouter.get('/my', authMiddleware, zValidator('query', paginationSchema), async (c) => {
  const user = c.get('user') as JwtPayload
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  const userReports = await db
    .select()
    .from(reports)
    .where(eq(reports.reporterId, user.userId))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ reports: userReports, page, limit })
})

// ─── Get Single Report ───────────────────────────────────────────

reportsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1)

  if (!report) {
    return c.json({ error: 'Laporan tidak ditemukan' }, 404)
  }

  // Get associated evidence files
  const evidence = await db
    .select()
    .from(evidenceFiles)
    .where(eq(evidenceFiles.reportId, id))

  return c.json({ report, evidence })
})

export default reportsRouter
