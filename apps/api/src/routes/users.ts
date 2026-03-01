import { Hono } from 'hono'
import { eq, desc, sql, count } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/index.js'
import { users, reports, comments, perpetrators } from '../db/schema.js'
import { authMiddleware, type JwtPayload } from '../middleware/auth.js'
import { paginationSchema, updateProfileSchema } from '../utils/validators.js'

const usersRouter = new Hono()

// ─── Get User Profile & Stats ─────────────────────────────────────

usersRouter.get('/profile', authMiddleware, async (c) => {
  const userPayload = c.get('user') as JwtPayload

  // Get user details
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userPayload.userId))
    .limit(1)

  if (!user) {
    return c.json({ error: 'Pengguna tidak ditemukan' }, 404)
  }

  // Get report stats
  const [totalReportsResult] = await db
    .select({ count: count() })
    .from(reports)
    .where(eq(reports.reporterId, user.id))

  const [verifiedReportsResult] = await db
    .select({ count: count() })
    .from(reports)
    .where(
      sql`${reports.reporterId} = ${user.id} AND ${reports.status} = 'verified'`
    )

  return c.json({
    user,
    stats: {
      totalReports: Number(totalReportsResult?.count || 0),
      verifiedReports: Number(verifiedReportsResult?.count || 0),
    }
  })
})

// ─── Update User Profile ──────────────────────────────────────────

usersRouter.patch('/profile', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const userPayload = c.get('user') as JwtPayload
  const data = c.req.valid('json')

  if (Object.keys(data).length === 0) {
    return c.json({ error: 'Tidak ada data untuk diperbarui' }, 400)
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userPayload.userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      role: users.role,
    })

  return c.json({
    message: 'Profil berhasil diperbarui',
    user: updatedUser,
  })
})

// ─── Get User Comments (Diskusi Saya) ─────────────────────────────

usersRouter.get('/comments', authMiddleware, zValidator('query', paginationSchema), async (c) => {
  const userPayload = c.get('user') as JwtPayload
  const { page, limit } = c.req.valid('query')
  const offset = (page - 1) * limit

  // Join comments with perpetrators to show where the comment was posted
  const userComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      upvotes: comments.upvotes,
      downvotes: comments.downvotes,
      createdAt: comments.createdAt,
      perpetrator: {
        id: perpetrators.id,
        entityName: perpetrators.entityName,
        accountNumber: perpetrators.accountNumber,
        phoneNumber: perpetrators.phoneNumber,
        bankName: perpetrators.bankName,
      }
    })
    .from(comments)
    .innerJoin(perpetrators, eq(comments.perpetratorId, perpetrators.id))
    .where(eq(comments.userId, userPayload.userId))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json({
    comments: userComments,
    page,
    limit,
    hasMore: userComments.length === limit
  })
})

export default usersRouter
