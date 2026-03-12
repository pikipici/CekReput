import { Hono } from 'hono'
import { eq, desc, and, or, not } from 'drizzle-orm'
import { db } from '../db/index.js'
import { perpetrators, reports, users, clarifications, comments, evidenceFiles } from '../db/schema.js'
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

  // SECURITY FIX: Only show verified reports to public
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
    .where(and(eq(reports.perpetratorId, id), eq(reports.status, 'verified')))
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ reports: perpReports, page, limit })
})

// ─── Get Related Reports (Info Terkait) ──────────────────────────

perpetratorsRouter.get('/:id/related', zValidator('query', paginationSchema), async (c) => {
  const id = c.req.param('id')
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  // 1. Fetch current perpetrator to get matching criteria
  const [currentPerp] = await db.select().from(perpetrators).where(eq(perpetrators.id, id)).limit(1)

  if (!currentPerp) {
    return c.json({ error: 'Data pelaku tidak ditemukan' }, 404)
  }

  // Define matcher conditions
  const conditions = []
  
  if (currentPerp.phoneNumber) {
    conditions.push(eq(perpetrators.phoneNumber, currentPerp.phoneNumber))
  }
  if (currentPerp.socialMedia) {
    conditions.push(eq(perpetrators.socialMedia, currentPerp.socialMedia))
  }
  if (currentPerp.entityName) {
    conditions.push(eq(perpetrators.entityName, currentPerp.entityName))
  }
  if (currentPerp.accountNumber) {
    conditions.push(eq(perpetrators.accountNumber, currentPerp.accountNumber))
  }

  if (conditions.length === 0) {
    return c.json({ reports: [], page, limit })
  }

  // 2. Query other reports from DIFFERENT perpetrators that match our conditions
  const relatedReports = await db
    .select({
      id: reports.id,
      category: reports.category,
      chronology: reports.chronology,
      incidentDate: reports.incidentDate,
      status: reports.status,
      createdAt: reports.createdAt,
      // Include perpetrator relation info to show what matched
      perpetrator: {
        id: perpetrators.id,
        entityName: perpetrators.entityName,
        phoneNumber: perpetrators.phoneNumber,
        socialMedia: perpetrators.socialMedia,
        accountNumber: perpetrators.accountNumber,
        bankName: perpetrators.bankName
      }
    })
    .from(reports)
    .innerJoin(perpetrators, eq(reports.perpetratorId, perpetrators.id))
    .where(
      and(
        or(...conditions),
        not(eq(perpetrators.id, id)), // Exclude the current perpetrator
        eq(reports.status, 'verified')
      )
    )
    .orderBy(desc(reports.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({ reports: relatedReports, page, limit })
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
        badges: users.badges,
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

  // SECURITY FIX: Only show verified reports in public timeline
  const perpReports = await db
    .select({
      id: reports.id,
      category: reports.category,
      status: reports.status,
      incidentDate: reports.incidentDate,
      createdAt: reports.createdAt,
      chronology: reports.chronology,
      lossAmount: reports.lossAmount,
    })
    .from(reports)
    .where(and(eq(reports.perpetratorId, id), eq(reports.status, 'verified')))
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
