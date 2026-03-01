/**
 * Seed script — inserts dummy data for testing.
 * Run: npx tsx --env-file .env src/db/seed.ts
 */
import { db } from './index.js'
import { users, perpetrators, reports, comments, clarifications, apiKeys } from './schema.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...\n')

  // ─── 1. Users ────────────────────────────────────────────────
  const hashedPw = bcrypt.hashSync('Password123!', 10)

  const [user1, user2, user3, user4, user5] = await db.insert(users).values([
    { name: 'Budi Santoso', email: 'budi@gmail.com', passwordHash: hashedPw, role: 'user' as const },
    { name: 'Siti Rahayu', email: 'siti.rahayu@yahoo.com', passwordHash: hashedPw, role: 'user' as const },
    { name: 'Ahmad Wijaya', email: 'ahmad.w@gmail.com', passwordHash: hashedPw, role: 'user' as const },
    { name: 'Dewi Lestari', email: 'dewi.lestari@outlook.com', passwordHash: hashedPw, role: 'moderator' as const },
    { name: 'Riko Pratama', email: 'riko.p@gmail.com', passwordHash: hashedPw, role: 'user' as const },
  ]).returning()

  console.log(`✅ ${5} users created`)

  // ─── 2. Perpetrators ────────────────────────────────────────
  const [perp1, perp2, perp3, perp4, perp5] = await db.insert(perpetrators).values([
    {
      accountNumber: '1234567890',
      bankName: 'BCA',
      entityName: 'Andi Susanto',
      accountType: 'bank' as const,
      threatLevel: 'danger' as const,
      totalReports: 5,
      verifiedReports: 4,
      firstReported: new Date('2025-06-15'),
      lastReported: new Date('2026-02-20'),
    },
    {
      accountNumber: '9876543210',
      bankName: 'BNI',
      entityName: 'Joko Widodo Palsu',
      accountType: 'bank' as const,
      threatLevel: 'danger' as const,
      totalReports: 8,
      verifiedReports: 6,
      firstReported: new Date('2025-03-10'),
      lastReported: new Date('2026-02-18'),
    },
    {
      phoneNumber: '081234567890',
      entityName: 'Unknown Seller',
      accountType: 'phone' as const,
      threatLevel: 'warning' as const,
      totalReports: 2,
      verifiedReports: 1,
      firstReported: new Date('2026-01-05'),
      lastReported: new Date('2026-02-01'),
    },
    {
      accountNumber: '0812999888777',
      bankName: 'Dana',
      entityName: 'Toko Elektronik Murah',
      accountType: 'ewallet' as const,
      threatLevel: 'warning' as const,
      totalReports: 3,
      verifiedReports: 2,
      firstReported: new Date('2025-11-20'),
      lastReported: new Date('2026-01-15'),
    },
    {
      accountNumber: '5551234567',
      bankName: 'Mandiri',
      entityName: 'PT Investasi Maju Jaya',
      accountType: 'bank' as const,
      threatLevel: 'danger' as const,
      totalReports: 12,
      verifiedReports: 10,
      firstReported: new Date('2024-08-01'),
      lastReported: new Date('2026-02-22'),
    },
  ]).returning()

  console.log(`✅ ${5} perpetrators created`)

  // ─── 3. Reports ──────────────────────────────────────────────
  const reportData = [
    // perp1 — 5 reports
    { perpetratorId: perp1.id, reporterId: user1.id, category: 'marketplace' as const, chronology: 'Saya membeli HP Samsung S24 di marketplace dengan harga Rp 8.5 juta. Setelah transfer ke rekening BCA 1234567890, penjual mengirim resi palsu dan kemudian memblokir kontak saya. Barang tidak pernah sampai.', incidentDate: '2025-06-15', status: 'verified' as const },
    { perpetratorId: perp1.id, reporterId: user2.id, category: 'marketplace' as const, chronology: 'Transaksi COD untuk laptop Asus ROG, tapi barang yang diterima adalah batu bata. Penjual tidak bisa dihubungi setelah paket diterima.', incidentDate: '2025-08-20', status: 'verified' as const },
    { perpetratorId: perp1.id, reporterId: user3.id, category: 'cod' as const, chronology: 'Penipu mengaku jual iPhone 15 Pro Max seharga 12 juta, setelah transfer barang gak pernah dikirim. Nomor diblokir.', incidentDate: '2025-11-10', status: 'verified' as const },
    { perpetratorId: perp1.id, reporterId: user5.id, category: 'marketplace' as const, chronology: 'Beli PS5 second seharga 4 juta, sudah transfer tapi seller menghilang. Screenshot chat masih ada.', incidentDate: '2026-01-05', status: 'verified' as const },
    { perpetratorId: perp1.id, reporterId: user4.id, category: 'marketplace' as const, chronology: 'Jual beli MacBook Air M2, sudah bayar setengah harga tapi barang tidak jadi dikirim. Penjual minta tambah uang terus.', incidentDate: '2026-02-20', status: 'pending' as const },

    // perp2 — 8 reports (6 verified, 2 pending)
    { perpetratorId: perp2.id, reporterId: user1.id, category: 'investasi' as const, chronology: 'Mengaku sebagai agen investasi resmi dengan janji profit 30% per bulan. Setelah setor modal Rp 50 juta, tidak ada pengembalian dan kontaknya hilang.', incidentDate: '2025-03-10', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user2.id, category: 'investasi' as const, chronology: 'Investasi bodong berkedok trading forex. Awalnya untung kecil, lalu diminta setor lebih banyak hingga Rp 100 juta. Platform tiba-tiba tidak bisa diakses.', incidentDate: '2025-05-20', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user3.id, category: 'investasi' as const, chronology: 'MLM investasi emas digital. Dijanjikan passive income Rp 5 juta/bulan tapi skema Ponzi, tidak ada produk nyata.', incidentDate: '2025-07-15', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user5.id, category: 'investasi' as const, chronology: 'Crypto scam via grup WhatsApp, diminta deposit ke rekening pribadi. Total kerugian Rp 25 juta.', incidentDate: '2025-09-01', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user4.id, category: 'investasi' as const, chronology: 'Aplikasi investasi palsu "InvestPro". Awalnya bisa withdraw, lalu diblock setelah deposit besar.', incidentDate: '2025-11-10', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user1.id, category: 'phishing' as const, chronology: 'Kirim link palsu via SMS mengatasnamakan bank BNI, minta data pribadi dan OTP. Saldo rekening tiba-tiba habis.', incidentDate: '2026-01-05', status: 'verified' as const },
    { perpetratorId: perp2.id, reporterId: user3.id, category: 'investasi' as const, chronology: 'Investasi saham gorengan. Dijanjikan return 50% dalam sebulan melalui grup Telegram.', incidentDate: '2026-02-10', status: 'pending' as const },
    { perpetratorId: perp2.id, reporterId: user5.id, category: 'investasi' as const, chronology: 'Robot trading otomatis palsu. Diminta bayar lisensi Rp 10 juta, software tidak bekerja.', incidentDate: '2026-02-18', status: 'pending' as const },

    // perp3 — 2 reports
    { perpetratorId: perp3.id, reporterId: user2.id, category: 'marketplace' as const, chronology: 'Jual beli online via Instagram. Penjual kirim foto barang tapi setelah transfer, di-block. Nomor HP 081234567890.', incidentDate: '2026-01-05', status: 'verified' as const },
    { perpetratorId: perp3.id, reporterId: user4.id, category: 'cod' as const, chronology: 'COD sepatu Nike tapi yang datang sepatu KW murahan. Seller tidak mau tanggung jawab.', incidentDate: '2026-02-01', status: 'pending' as const },

    // perp4 — 3 reports
    { perpetratorId: perp4.id, reporterId: user1.id, category: 'marketplace' as const, chronology: 'Toko online palsu di Shopee dengan review palsu. Setelah beli TV senilai Rp 3 juta via Dana, barang tidak dikirim.', incidentDate: '2025-11-20', status: 'verified' as const },
    { perpetratorId: perp4.id, reporterId: user3.id, category: 'marketplace' as const, chronology: 'Jual speaker Bluetooth seharga Rp 500rb, barang dikirim tapi rusak dan tidak sesuai deskripsi. Seller menolak refund.', incidentDate: '2025-12-15', status: 'verified' as const },
    { perpetratorId: perp4.id, reporterId: user5.id, category: 'marketplace' as const, chronology: 'Beli action camera, yang dikirim barang bekas rusak. Penjual menghilang.', incidentDate: '2026-01-15', status: 'pending' as const },

    // perp5 — 12 reports (10 verified, 2 pending)
    { perpetratorId: perp5.id, reporterId: user1.id, category: 'investasi' as const, chronology: 'PT Investasi Maju Jaya menawarkan deposito dengan bunga 5% per bulan. Sudah setor Rp 200 juta tapi perusahaan ternyata tidak terdaftar di OJK.', incidentDate: '2024-08-01', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user2.id, category: 'investasi' as const, chronology: 'Skema Ponzi berkedok peer-to-peer lending. Modal Rp 50 juta hilang.', incidentDate: '2024-10-15', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user3.id, category: 'investasi' as const, chronology: 'Koperasi simpan pinjam ilegal, tidak terdaftar resmi. Dana anggota Rp 30 juta tidak bisa dicairkan.', incidentDate: '2024-12-01', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user4.id, category: 'investasi' as const, chronology: 'Investasi properti fiktif. Dijual kavling tanah yang ternyata bukan milik perusahaan.', incidentDate: '2025-02-10', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user5.id, category: 'investasi' as const, chronology: 'Trading binary option ilegal. Kerugian total Rp 75 juta.', incidentDate: '2025-04-20', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user1.id, category: 'investasi' as const, chronology: 'Money game berkedok arisan online. Peserta awal untung, peserta baru rugi.', incidentDate: '2025-06-15', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user2.id, category: 'investasi' as const, chronology: 'Crowdfunding palsu untuk proyek fiktif. Dana terkumpul Rp 500 juta menghilang.', incidentDate: '2025-08-01', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user3.id, category: 'investasi' as const, chronology: 'Penipuan emas Antam palsu. Sertifikat palsu, emas ternyata kuningan.', incidentDate: '2025-10-10', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user4.id, category: 'investasi' as const, chronology: 'Investasi waralaba bodong. Fee waralaba Rp 20 juta, tapi tidak ada support dari pusat.', incidentDate: '2025-12-20', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user5.id, category: 'investasi' as const, chronology: 'Asuransi unit link ilegal. Premi dibayar tapi klaim tidak pernah diproses.', incidentDate: '2026-01-15', status: 'verified' as const },
    { perpetratorId: perp5.id, reporterId: user1.id, category: 'investasi' as const, chronology: 'Penawaran saham pre-IPO palsu via WhatsApp. Diminta bayar Rp 15 juta untuk "lot khusus".', incidentDate: '2026-02-10', status: 'pending' as const },
    { perpetratorId: perp5.id, reporterId: user2.id, category: 'investasi' as const, chronology: 'Penawaran franchise coffee shop fiktif. Bayar lisensi Rp 50 juta tapi tidak ada follow up.', incidentDate: '2026-02-22', status: 'pending' as const },
  ]

  await db.insert(reports).values(reportData)
  console.log(`✅ ${reportData.length} reports created`)

  // ─── 4. Comments ─────────────────────────────────────────────
  const commentData = [
    { perpetratorId: perp1.id, userId: user2.id, content: 'Saya juga pernah kena tipu sama orang ini! Modusnya persis sama, jual HP murah di marketplace.', upvotes: 15, downvotes: 0 },
    { perpetratorId: perp1.id, userId: user3.id, content: 'Hati-hati, dia sekarang pakai akun baru tapi nomor rekening masih sama.', upvotes: 22, downvotes: 1 },
    { perpetratorId: perp1.id, userId: user5.id, content: 'Sudah saya laporkan juga ke polisi, tapi prosesnya lama.', upvotes: 8, downvotes: 0 },
    { perpetratorId: perp2.id, userId: user1.id, content: 'Modusnya sangat rapi, awalnya memang kasih profit kecil supaya korban percaya.', upvotes: 31, downvotes: 2 },
    { perpetratorId: perp2.id, userId: user4.id, content: 'Grup WhatsApp-nya masih aktif dengan ratusan anggota baru. Tolong sebarkan info ini!', upvotes: 45, downvotes: 0 },
    { perpetratorId: perp2.id, userId: user5.id, content: 'Ini pasti sindikat, karena ada beberapa nomor rekening yang terkait.', upvotes: 18, downvotes: 3 },
    { perpetratorId: perp5.id, userId: user1.id, content: 'PT ini sudah masuk daftar investasi ilegal OJK. Cek di website OJK.', upvotes: 67, downvotes: 0 },
    { perpetratorId: perp5.id, userId: user3.id, content: 'Total korban di grup kami sudah lebih dari 50 orang dengan kerugian miliaran.', upvotes: 38, downvotes: 1 },
    { perpetratorId: perp5.id, userId: user4.id, content: 'Sudah ada class action lawsuit terhadap perusahaan ini.', upvotes: 29, downvotes: 0 },
    { perpetratorId: perp3.id, userId: user5.id, content: 'Nomor HP ini juga dipakai untuk penipuan di Tokopedia.', upvotes: 5, downvotes: 0 },
    { perpetratorId: perp4.id, userId: user2.id, content: 'Toko ini masih aktif di Shopee dengan nama baru!', upvotes: 12, downvotes: 0 },
  ]

  await db.insert(comments).values(commentData)
  console.log(`✅ ${commentData.length} comments created`)

  // ─── 5. Clarifications ───────────────────────────────────────
  const clarificationData = [
    { perpetratorId: perp3.id, requesterId: user5.id, statement: 'Saya adalah pemilik nomor HP 081234567890. Ini salah paham, transaksi sebenarnya sudah diselesaikan. Pembeli tidak sabar menunggu pengiriman yang memang lama karena dari luar kota. Saya punya bukti resi pengiriman.', status: 'pending' as const, evidenceUrls: [] },
    { perpetratorId: perp4.id, requesterId: user3.id, statement: 'Saya adalah pemilik toko di Shopee. Barang yang dikirim memang sesuai deskripsi, namun rusak di perjalanan. Saya sudah ajukan klaim ke ekspedisi dan siap ganti rugi. Ini bukan penipuan.', status: 'pending' as const, evidenceUrls: [] },
    { perpetratorId: perp1.id, requesterId: user4.id, statement: 'Rekening ini bukan milik saya, kemungkinan digunakan oleh pihak lain tanpa sepengetahuan saya. Saya korban identity theft.', status: 'rejected' as const, evidenceUrls: [] },
  ]

  await db.insert(clarifications).values(clarificationData)
  console.log(`✅ ${clarificationData.length} clarifications created`)

  // ─── 6. API Keys ─────────────────────────────────────────────
  const apiKeyData = [
    { userId: user1.id, keyHash: 'hash_dummy_key_001_budi', label: 'Budi App Production', isActive: true },
    { userId: user3.id, keyHash: 'hash_dummy_key_002_ahmad', label: 'Ahmad Testing Key', isActive: true },
    { userId: user5.id, keyHash: 'hash_dummy_key_003_riko', label: 'Riko Bot Integration', isActive: false },
  ]

  await db.insert(apiKeys).values(apiKeyData)
  console.log(`✅ ${apiKeyData.length} API keys created`)

  console.log('\n🎉 Seed complete! Summary:')
  console.log('   5 users (password: Password123!)')
  console.log('   5 perpetrators (2 danger, 2 warning, 1 danger)')
  console.log('   30 reports (22 verified, 2 rejected, 6 pending)')
  console.log('   11 comments')
  console.log('   3 clarifications (2 pending, 1 rejected)')
  console.log('   3 API keys')

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
