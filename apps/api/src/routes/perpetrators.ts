import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { perpetrators, reports, users, apiKeys, clarifications, comments, evidenceFiles } from '../db/schema.js'
import { maskAccountNumber, maskPhoneNumber, maskEntityName } from '../utils/masking.js'
import { paginationSchema } from '../utils/validators.js'
import { zValidator } from '@hono/zod-validator'

const perpetratorsRouter = new Hono()

// ─── Get Perpetrator Detail ──────────────────────────────────────

perpetratorsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  const [perp] = await db.select().from(perpetrators).where(eq(perpetrators.id, id)).limit(1)

  if (!perp) {
    return c.json({ error: 'Data pelaku tidak ditemukan' }, 404)
  }

  return c.json({
    perpetrator: {
      id: perp.id,
      accountNumber: maskAccountNumber(perp.accountNumber),
      phoneNumber: maskPhoneNumber(perp.phoneNumber),
      entityName: maskEntityName(perp.entityName),
      bankName: perp.bankName,
      accountType: perp.accountType,
      threatLevel: perp.threatLevel,
      totalReports: perp.totalReports,
      verifiedReports: perp.verifiedReports,
      firstReported: perp.firstReported,
      lastReported: perp.lastReported,
      socialMedia: perp.socialMedia,
      totalLoss: perp.totalLoss,
    },
  })
})

// ─── Get Perpetrator's Reports ───────────────────────────────────

perpetratorsRouter.get('/:id/reports', zValidator('query', paginationSchema), async (c) => {
  const id = c.req.param('id')
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  // Only show verified reports to public
  const perpReports = await db
    .select({
      id: reports.id,
      category: reports.category,
      chronology: reports.chronology,
      incidentDate: reports.incidentDate,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.perpetratorId, id))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ reports: perpReports, page, limit })
})

// ─── Get Perpetrator's Verified Evidence ──────────────────────────

perpetratorsRouter.get('/:id/verified-evidence', async (c) => {
  const id = c.req.param('id')

  const verifiedReports = await db
    .select({
      id: reports.id,
      incidentDate: reports.incidentDate,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(and(eq(reports.perpetratorId, id), eq(reports.status, 'verified')))
    .orderBy(desc(reports.createdAt))

  if (verifiedReports.length === 0) {
    return c.json({ verifiedEvidence: [] })
  }

  const reportIds = verifiedReports.map(r => r.id)
  
  // To avoid query size limits, just do a simple IN fetch if within limits, or fetch all evidence for the perpetrator via join
  const evidence = await db
    .select({
      id: evidenceFiles.id,
      reportId: evidenceFiles.reportId,
      fileUrl: evidenceFiles.fileUrl,
      mimeType: evidenceFiles.mimeType,
    })
    .from(evidenceFiles)
    .innerJoin(reports, eq(evidenceFiles.reportId, reports.id))
    .where(and(eq(reports.perpetratorId, id), eq(reports.status, 'verified')))

  const result = verifiedReports.map(report => ({
    ...report,
    evidenceFiles: evidence.filter(e => e.reportId === report.id)
  }))

  return c.json({ verifiedEvidence: result })
})

// ─── Get Perpetrator's Comments ──────────────────────────────────

perpetratorsRouter.get('/:id/comments', zValidator('query', paginationSchema), async (c) => {
  const id = c.req.param('id')
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  const perpComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      upvotes: comments.upvotes,
      downvotes: comments.downvotes,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        name: users.name,
        role: users.role,
      }
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.perpetratorId, id))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ comments: perpComments, page, limit })
})

// ─── Get Perpetrator's Timeline Data ─────────────────────────────

perpetratorsRouter.get('/:id/timeline', async (c) => {
  const id = c.req.param('id')

  const perpReports = await db
    .select({
      id: reports.id,
      category: reports.category,
      status: reports.status,
      incidentDate: reports.incidentDate,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.perpetratorId, id))
    .orderBy(reports.incidentDate)

  return c.json({ timeline: perpReports })
})

// ─── Get Perpetrator's Clarifications ────────────────────────────

perpetratorsRouter.get('/:id/clarifications', async (c) => {
  const id = c.req.param('id')

  const approved = await db
    .select({
      id: clarifications.id,
      statement: clarifications.statement,
      evidenceUrls: clarifications.evidenceUrls,
      relationType: clarifications.relationType,
      createdAt: clarifications.createdAt,
    })
    .from(clarifications)
    .where(and(eq(clarifications.perpetratorId, id), eq(clarifications.status, 'approved')))
    .orderBy(desc(clarifications.createdAt))

  return c.json({ clarifications: approved })
})

export default perpetratorsRouter
