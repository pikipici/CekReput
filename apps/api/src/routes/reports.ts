import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { reports, perpetrators, evidenceFiles } from '../db/schema.js'
import { createReportSchema, paginationSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { reportRateLimit } from '../middleware/rate-limit.js'
import redis from '../lib/redis.js'
import { verifyTurnstile } from '../utils/turnstile.js'
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

    // Verify Turnstile
    const clientIp = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip')
    const isBotFree = await verifyTurnstile(data.turnstileToken, clientIp)
    if (!isBotFree) {
      return c.json({ error: 'Verifikasi Anti-Bot (Turnstile) gagal. Silakan coba lagi.' }, 403)
    }

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
        socialMedia: data.socialMedia && data.socialMedia.length > 0 ? data.socialMedia.join(', ') : null,
        accountType: data.accountType,
        firstReported: new Date(),
        lastReported: new Date(),
        totalReports: 1,
        totalLoss: data.lossAmount || 0,
      }).returning()
      perpetrator = newPerp
    } else {
      let updatedSm = perpetrator.socialMedia
      if (data.socialMedia && data.socialMedia.length > 0) {
        const existingSm = perpetrator.socialMedia ? perpetrator.socialMedia.split(', ') : []
        updatedSm = Array.from(new Set([...existingSm, ...data.socialMedia])).join(', ')
      }

      let updatedEntityName = perpetrator.entityName
      if (data.entityName && data.entityName.trim() !== '') {
        const newName = data.entityName.trim()
        if (!updatedEntityName) {
          updatedEntityName = newName
        } else {
          const existingNames = updatedEntityName.split(',').map(n => n.trim())
          const existingLower = existingNames.map(n => n.toLowerCase())
          if (!existingLower.includes(newName.toLowerCase())) {
            updatedEntityName = `${updatedEntityName}, ${newName}`
          }
        }
      }

      // Update existing perpetrator
      await db.update(perpetrators).set({
        totalReports: perpetrator.totalReports + 1,
        totalLoss: perpetrator.totalLoss + (data.lossAmount || 0),
        lastReported: new Date(),
        entityName: updatedEntityName,
        bankName: perpetrator.bankName ?? data.bankName ?? null,
        socialMedia: updatedSm !== perpetrator.socialMedia ? updatedSm : perpetrator.socialMedia,
      }).where(eq(perpetrators.id, perpetrator.id))
    }

    // Create report with status 'pending'
    const [report] = await db.insert(reports).values({
      perpetratorId: perpetrator.id,
      reporterId: user.userId,
      category: data.category,
      chronology: data.chronology,
      incidentDate: data.incidentDate,
      lossAmount: data.lossAmount,
      evidenceLink: data.evidenceLink && data.evidenceLink.length > 0 ? data.evidenceLink : null,
      status: 'pending',
    }).returning()

    // Insert evidence files if provided
    if (data.evidenceFiles && data.evidenceFiles.length > 0) {
      await db.insert(evidenceFiles).values(
        data.evidenceFiles.map(file => ({
          reportId: report.id,
          fileUrl: file.url,
          fileName: file.name,
          mimeType: file.mimeType,
          fileSizeBytes: file.sizeBytes,
        }))
      )
    }

    // --- Invalidate Caches ---
    try {
      await redis.del('stats:public')
      await redis.del('reports:recent')
      const stream = redis.scanStream({ match: 'check:*', count: 100 })
      stream.on('data', async (keys) => {
        if (keys.length) {
          await redis.del(...keys)
        }
      })
    } catch (err) {
      console.error('Redis Invalidation Error:', err)
    }

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

  // SECURITY FIX: Only show verified reports to public
  const [report] = await db.select().from(reports).where(and(eq(reports.id, id), eq(reports.status, 'verified'))).limit(1)

  if (!report) {
    return c.json({ error: 'Laporan tidak ditemukan atau belum diverifikasi' }, 404)
  }

  // Get associated evidence files (only for verified reports)
  const evidence = await db
    .select()
    .from(evidenceFiles)
    .where(eq(evidenceFiles.reportId, id))

  // Mask sensitive reporter information
  const safeReport = {
    id: report.id,
    perpetratorId: report.perpetratorId,
    category: report.category,
    chronology: report.chronology,
    incidentDate: report.incidentDate,
    lossAmount: report.lossAmount,
    status: report.status,
    createdAt: report.createdAt,
    // Don't expose: reporterId, evidenceLink (use evidence files instead), rejectionReason, moderatedBy, moderatedAt
  }

  return c.json({ report: safeReport, evidence })
})

export default reportsRouter
