import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { comments } from '../db/schema.js'
import { createCommentSchema, voteSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'
import { commentRateLimit } from '../middleware/rate-limit.js'
import { verifyTurnstile } from '../utils/turnstile.js'

const commentsRouter = new Hono()

// ─── Create Comment ──────────────────────────────────────────────

commentsRouter.post(
  '/',
  authMiddleware,
  commentRateLimit,
  zValidator('json', createCommentSchema),
  async (c) => {
    const user = c.get('user') as JwtPayload
    const { perpetratorId, content, turnstileToken } = c.req.valid('json')

    const clientIp = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip')
    const isBotFree = await verifyTurnstile(turnstileToken, clientIp)
    if (!isBotFree) {
      return c.json({ error: 'Verifikasi Anti-Bot gagal. Silakan coba lagi.' }, 403)
    }

    const [comment] = await db.insert(comments).values({
      perpetratorId,
      userId: user.userId,
      content,
    }).returning()

    return c.json({ comment }, 201)
  }
)

// ─── Vote on Comment ─────────────────────────────────────────────

commentsRouter.post(
  '/:id/vote',
  authMiddleware,
  zValidator('json', voteSchema),
  async (c) => {
    const id = c.req.param('id')
    const { type } = c.req.valid('json')

    const field = type === 'up' ? comments.upvotes : comments.downvotes

    const [updated] = await db
      .update(comments)
      .set({ [type === 'up' ? 'upvotes' : 'downvotes']: sql`${field} + 1` })
      .where(eq(comments.id, id))
      .returning()

    if (!updated) {
      return c.json({ error: 'Komentar tidak ditemukan' }, 404)
    }

    return c.json({ comment: updated })
  }
)

// ─── Delete Comment (owner only) ─────────────────────────────────

commentsRouter.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const user = c.get('user') as JwtPayload

  const [comment] = await db.select().from(comments).where(eq(comments.id, id)).limit(1)

  if (!comment) {
    return c.json({ error: 'Komentar tidak ditemukan' }, 404)
  }

  if (comment.userId !== user.userId && user.role !== 'admin') {
    return c.json({ error: 'Anda hanya bisa menghapus komentar milik sendiri' }, 403)
  }

  await db.delete(comments).where(eq(comments.id, id))

  return c.json({ message: 'Komentar berhasil dihapus' })
})

export default commentsRouter
