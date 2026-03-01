import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { clarifications, perpetrators, users } from '../db/schema.js'
import { createClarificationSchema, moderateClarificationSchema, paginationSchema } from '../utils/validators.js'
import { authMiddleware, type JwtPayload } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'
import { reportRateLimit } from '../middleware/rate-limit.js'

const clarificationsRouter = new Hono()

// ─── Create Clarification (Public) ────────────────────────────────

clarificationsRouter.post(
  '/',
  authMiddleware,
  reportRateLimit,
  zValidator('json', createClarificationSchema),
  async (c) => {
    const user = c.get('user') as JwtPayload
    const data = c.req.valid('json')

    // Check if perpetrator exists
    const [perp] = await db
      .select()
      .from(perpetrators)
      .where(eq(perpetrators.id, data.perpetratorId))
      .limit(1)

    if (!perp) {
      return c.json({ error: 'Pelaku tidak ditemukan' }, 404)
    }

    const [clarification] = await db.insert(clarifications).values({
      perpetratorId: data.perpetratorId,
      requesterId: user.userId,
      statement: data.statement,
      identityPhotoUrl: data.identityPhotoUrl,
      selfiePhotoUrl: data.selfiePhotoUrl,
      identityName: data.identityName,
      identityNik: data.identityNik,
      relationType: data.relationType,
      evidenceUrls: data.evidenceUrls,
      status: 'pending',
    }).returning()

    return c.json({
      message: 'Klarifikasi berhasil dikirim. Akan direview oleh admin.',
      clarification: {
        id: clarification.id,
        status: clarification.status,
      },
    }, 201)
  }
)

// ─── Get Pending Clarifications (Admin) ───────────────────────────

clarificationsRouter.get(
  '/admin/pending',
  authMiddleware,
  adminMiddleware,
  zValidator('query', paginationSchema),
  async (c) => {
    const { page, limit } = c.req.valid('query')
    const offset = (page - 1) * limit

    const pending = await db
      .select({
        id: clarifications.id,
        perpetratorId: clarifications.perpetratorId,
        requesterId: clarifications.requesterId,
        statement: clarifications.statement,
        status: clarifications.status,
        identityPhotoUrl: clarifications.identityPhotoUrl,
        selfiePhotoUrl: clarifications.selfiePhotoUrl,
        identityName: clarifications.identityName,
        identityNik: clarifications.identityNik,
        relationType: clarifications.relationType,
        evidenceUrls: clarifications.evidenceUrls,
        createdAt: clarifications.createdAt,
        requesterName: users.name,
        requesterEmail: users.email,
        perpetratorData: perpetrators.accountNumber,
        perpetratorPhone: perpetrators.phoneNumber,
        perpetratorName: perpetrators.entityName,
      })
      .from(clarifications)
      .innerJoin(users, eq(clarifications.requesterId, users.id))
      .innerJoin(perpetrators, eq(clarifications.perpetratorId, perpetrators.id))
      .where(eq(clarifications.status, 'pending'))
      .orderBy(desc(clarifications.createdAt))
      .limit(limit)
      .offset(offset)

    return c.json({ clarifications: pending, page, limit })
  }
)

// ─── Moderate Clarification (Admin) ───────────────────────────────

clarificationsRouter.patch(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  zValidator('json', moderateClarificationSchema),
  async (c) => {
    const id = c.req.param('id')
    const user = c.get('user') as JwtPayload
    const { action, resetThreat } = c.req.valid('json')

    const [clarification] = await db
      .select()
      .from(clarifications)
      .where(eq(clarifications.id, id))
      .limit(1)

    if (!clarification) {
      return c.json({ error: 'Data klasifikasi tidak ditemukan' }, 404)
    }

    if (clarification.status !== 'pending') {
      return c.json({ error: 'Klarifikasi ini sudah diproses' }, 400)
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    const [updated] = await db
      .update(clarifications)
      .set({
        status: newStatus,
        reviewedBy: user.userId,
        reviewedAt: new Date(),
      })
      .where(eq(clarifications.id, id))
      .returning()

    if (newStatus === 'approved' && resetThreat) {
      await db
        .update(perpetrators)
        .set({
          threatLevel: 'safe'
        })
        .where(eq(perpetrators.id, clarification.perpetratorId))
    }

    return c.json({
      message: action === 'approve'
        ? 'Klarifikasi disetujui'
        : 'Klarifikasi ditolak',
      clarification: updated,
    })
  }
)

export default clarificationsRouter
