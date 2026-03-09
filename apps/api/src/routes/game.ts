import { Hono } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { perpetrators, reports } from '../db/schema.js'
import { maskAccountNumber, maskPhoneNumber, maskEntityName } from '../utils/masking.js'

const game = new Hono()

// ─── Get Game Detail with All Perpetrators ───────────────────────

game.get('/:platform/:gameId', async (c) => {
  const { platform, gameId } = c.req.param()

  if (!gameId || !platform) {
    return c.json({ error: 'Platform dan ID Game harus diisi' }, 400)
  }

  // Find all perpetrators with this gameId
  // Search in reports chronology for hackback category
  const searchPattern = `%[Target Hak milik: Akun ${platform} (${gameId})]%`
  
  const relatedPerpetrators = await db
    .select({
      id: perpetrators.id,
      accountNumber: perpetrators.accountNumber,
      phoneNumber: perpetrators.phoneNumber,
      entityName: perpetrators.entityName,
      bankName: perpetrators.bankName,
      accountType: perpetrators.accountType,
      threatLevel: perpetrators.threatLevel,
      totalReports: perpetrators.totalReports,
      verifiedReports: perpetrators.verifiedReports,
      firstReported: perpetrators.firstReported,
      lastReported: perpetrators.lastReported,
      totalLoss: perpetrators.totalLoss,
    })
    .from(perpetrators)
    .leftJoin(reports, eq(perpetrators.id, reports.perpetratorId))
    .where(
      sql`${reports.category} = 'hackback' AND ${reports.chronology} ILIKE ${searchPattern}`
    )
    .groupBy(
      perpetrators.id,
      perpetrators.accountNumber,
      perpetrators.phoneNumber,
      perpetrators.entityName,
      perpetrators.bankName,
      perpetrators.accountType,
      perpetrators.threatLevel,
      perpetrators.totalReports,
      perpetrators.verifiedReports,
      perpetrators.firstReported,
      perpetrators.lastReported,
      perpetrators.totalLoss
    )
    .having(sql`COUNT(CASE WHEN ${reports.status} = 'verified' THEN 1 END) > 0 OR ${perpetrators.verifiedReports} > 0`)

  if (relatedPerpetrators.length === 0) {
    return c.json({ error: 'ID Game tidak ditemukan' }, 404)
  }

  // Calculate aggregated stats
  const totalReports = relatedPerpetrators.reduce((sum, p) => sum + p.totalReports, 0)
  const totalVerifiedReports = relatedPerpetrators.reduce((sum, p) => sum + p.verifiedReports, 0)
  const totalLoss = relatedPerpetrators.reduce((sum, p) => sum + (p.totalLoss ?? 0), 0)

  // Get earliest and latest dates
  let firstReported: Date | null = null
  let lastReported: Date | null = null

  relatedPerpetrators.forEach((p) => {
    if (p.firstReported) {
      const date = new Date(p.firstReported)
      if (!firstReported || date < firstReported) {
        firstReported = date
      }
    }
    if (p.lastReported) {
      const date = new Date(p.lastReported)
      if (!lastReported || date > lastReported) {
        lastReported = date
      }
    }
  })

  // Get highest threat level
  const threatLevelOrder = { danger: 3, warning: 2, safe: 1 }
  const highestThreat = relatedPerpetrators.reduce((highest, p) => {
    return (threatLevelOrder[p.threatLevel as keyof typeof threatLevelOrder] ?? 0) >
           (threatLevelOrder[highest as keyof typeof threatLevelOrder] ?? 0)
      ? p.threatLevel
      : highest
  }, 'safe')

  // Mask sensitive data
  const maskedPerpetrators = relatedPerpetrators.map((p) => ({
    id: p.id,
    accountNumber: maskAccountNumber(p.accountNumber),
    phoneNumber: maskPhoneNumber(p.phoneNumber),
    entityName: maskEntityName(p.entityName),
    bankName: p.bankName,
    accountType: p.accountType,
    threatLevel: p.threatLevel,
    totalReports: p.totalReports,
    verifiedReports: p.verifiedReports,
    firstReported: p.firstReported,
    lastReported: p.lastReported,
    totalLoss: p.totalLoss,
  }))

  return c.json({
    game: {
      platform,
      gameId,
      totalPerpetrators: relatedPerpetrators.length,
      totalReports,
      totalVerifiedReports,
      totalLoss,
      firstReported,
      lastReported,
      threatLevel: highestThreat,
    },
    perpetrators: maskedPerpetrators,
  })
})

export default game
