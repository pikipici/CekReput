import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { clarifications } from '../db/schema.js'
import { createClarificationSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'
import type { JwtPayload } from '../middleware/auth.js'

const clarificationsRouter = new Hono()

// ─── Submit Clarification Request ────────────────────────────────

clarificationsRouter.post(
  '/',
  authMiddleware,
  zValidator('json', createClarificationSchema),
  async (c) => {
    const user = c.get('user') as JwtPayload
    const { perpetratorId, statement } = c.req.valid('json')

    const [clarification] = await db.insert(clarifications).values({
      perpetratorId,
      requesterId: user.userId,
      statement,
      status: 'pending',
    }).returning()

    return c.json({
      message: 'Klarifikasi berhasil diajukan. Akan direview oleh admin.',
      clarification,
    }, 201)
  }
)

// ─── Get Approved Clarifications for a Perpetrator ────────────────

clarificationsRouter.get('/perpetrator/:id', async (c) => {
  const id: string = c.req.param('id')

  const approved = await db
    .select()
    .from(clarifications)
    .where(eq(clarifications.perpetratorId, id))
    .orderBy(desc(clarifications.createdAt))

  return c.json({ clarifications: approved })
})

// ─── Review Clarification (Admin) ────────────────────────────────

clarificationsRouter.patch(
  '/:id/review',
  authMiddleware,
  adminMiddleware,
  async (c) => {
    const id = c.req.param('id')!
    const user = c.get('user') as JwtPayload
    const { action } = await c.req.json<{ action: 'approve' | 'reject' }>()

    const [updated] = await db
      .update(clarifications)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: user.userId,
        reviewedAt: new Date(),
      })
      .where(eq(clarifications.id, id))
      .returning()

    if (!updated) {
      return c.json({ error: 'Klarifikasi tidak ditemukan' }, 404)
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
