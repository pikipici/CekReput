/**
 * Add social_media column to perpetrators table.
 * Run: npx tsx --env-file .env src/db/migrate-social.ts
 */
import { db } from './index.js'
import { sql } from 'drizzle-orm'

async function migrate() {
  console.log('🔧 Adding social_media column...')
  await db.execute(sql`ALTER TABLE perpetrators ADD COLUMN IF NOT EXISTS social_media varchar(500)`)
  console.log('✅ Done! Column social_media added to perpetrators table.')

  // Update some dummy data with social media
  await db.execute(sql`UPDATE perpetrators SET social_media = '@andisusanto_fake (Instagram)' WHERE entity_name = 'Andi Susanto'`)
  await db.execute(sql`UPDATE perpetrators SET social_media = 't.me/investpro_joko (Telegram)' WHERE entity_name = 'Joko Widodo Palsu'`)
  await db.execute(sql`UPDATE perpetrators SET social_media = '@tokosepatu.online (Instagram), facebook.com/tokosepatuonline' WHERE entity_name = 'Toko Sepatu Online'`)
  await db.execute(sql`UPDATE perpetrators SET social_media = '@gadgetmurah.ig (Instagram)' WHERE entity_name = 'Seller Gadget Murah'`)
  await db.execute(sql`UPDATE perpetrators SET social_media = '@rentalps5.id (Instagram), wa.me/082198765432' WHERE entity_name = 'Rental PS5 Palsu'`)

  console.log('✅ Updated 5 perpetrators with dummy social media data.')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
