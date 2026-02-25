/**
 * Add more perpetrators for testing.
 * Run: npx tsx --env-file .env src/db/seed-more.ts
 */
import { db } from './index.js'
import { perpetrators, reports, users } from './schema.js'

async function addMore() {
  console.log('🌱 Adding more perpetrators...\n')

  const existingUsers = await db.select({ id: users.id }).from(users).limit(3)
  const [u1, u2, u3] = existingUsers

  const [p1, p2, p3, p4, p5] = await db.insert(perpetrators).values([
    { accountNumber: '7771234001', bankName: 'BRI', entityName: 'Slamet Riyadi', accountType: 'bank' as const, threatLevel: 'danger' as const, totalReports: 4, verifiedReports: 3, firstReported: new Date('2025-09-01'), lastReported: new Date('2026-02-15') },
    { phoneNumber: '089512345678', entityName: 'Seller Gadget Murah', accountType: 'phone' as const, threatLevel: 'warning' as const, totalReports: 2, verifiedReports: 1, firstReported: new Date('2026-01-10'), lastReported: new Date('2026-02-10') },
    { accountNumber: '0081122334455', bankName: 'OVO', entityName: 'Toko Sepatu Online', accountType: 'ewallet' as const, threatLevel: 'safe' as const, totalReports: 1, verifiedReports: 0, firstReported: new Date('2026-02-20'), lastReported: new Date('2026-02-20') },
    { accountNumber: '3216549870', bankName: 'CIMB Niaga', entityName: 'CV Berkah Sejahtera', accountType: 'bank' as const, threatLevel: 'danger' as const, totalReports: 7, verifiedReports: 5, firstReported: new Date('2025-04-10'), lastReported: new Date('2026-02-23') },
    { phoneNumber: '082198765432', bankName: 'GoPay', entityName: 'Rental PS5 Palsu', accountType: 'ewallet' as const, threatLevel: 'warning' as const, totalReports: 3, verifiedReports: 2, firstReported: new Date('2025-12-01'), lastReported: new Date('2026-02-01') },
  ]).returning()

  console.log('✅ 5 perpetrators added')

  await db.insert(reports).values([
    // Slamet Riyadi — Penipuan Lowongan Kerja
    { perpetratorId: p1.id, reporterId: u1.id, category: 'lowker' as const, chronology: 'Penawaran kerja di luar negeri dengan gaji besar, diminta bayar biaya administrasi Rp 15 juta ke rekening BRI. Ternyata lowongan palsu.', incidentDate: '2025-09-01', status: 'verified' as const },
    { perpetratorId: p1.id, reporterId: u2.id, category: 'lowker' as const, chronology: 'Mengaku HRD perusahaan ternama, minta transfer biaya training Rp 5 juta. Setelah transfer, tidak ada kelanjutan.', incidentDate: '2025-11-15', status: 'verified' as const },
    { perpetratorId: p1.id, reporterId: u3.id, category: 'lowker' as const, chronology: 'Lowongan kerja palsu lewat Telegram. Diminta beli seragam dan perlengkapan Rp 3 juta. Barang tak pernah sampai.', incidentDate: '2026-01-20', status: 'verified' as const },
    { perpetratorId: p1.id, reporterId: u1.id, category: 'lowker' as const, chronology: 'Modus freelance data entry, diminta deposit Rp 2 juta sebagai jaminan. Uang tidak dikembalikan.', incidentDate: '2026-02-15', status: 'pending' as const },

    // Seller Gadget Murah — Marketplace
    { perpetratorId: p2.id, reporterId: u2.id, category: 'marketplace' as const, chronology: 'Jual tablet iPad murah via IG. Setelah transfer Rp 4 juta, barang tidak dikirim dan akun dihapus.', incidentDate: '2026-01-10', status: 'verified' as const },
    { perpetratorId: p2.id, reporterId: u3.id, category: 'marketplace' as const, chronology: 'Jual kamera mirrorless second, foto produk ternyata dari Google. Barang tidak ada.', incidentDate: '2026-02-10', status: 'pending' as const },

    // Toko Sepatu Online — COD
    { perpetratorId: p3.id, reporterId: u1.id, category: 'cod' as const, chronology: 'Beli sepatu Nike Air Jordan via COD, ternyata barang KW. Tapi seller klaim itu original.', incidentDate: '2026-02-20', status: 'pending' as const },

    // CV Berkah Sejahtera — Pinjol Ilegal (7 reports)
    { perpetratorId: p4.id, reporterId: u1.id, category: 'pinjol' as const, chronology: 'CV Berkah Sejahtera mengaku pinjaman online resmi. Bunga ternyata 30% per minggu, debt collector intimidasi keluarga saya.', incidentDate: '2025-04-10', status: 'verified' as const },
    { perpetratorId: p4.id, reporterId: u2.id, category: 'pinjol' as const, chronology: 'Pinjol ilegal, menyebar data pribadi ke semua kontak saat terlambat bayar 1 hari. Total tagihan membengkak 5x lipat.', incidentDate: '2025-07-20', status: 'verified' as const },
    { perpetratorId: p4.id, reporterId: u3.id, category: 'pinjol' as const, chronology: 'Aplikasi pinjol palsu. Setelah instal, diminta akses kontak dan galeri foto. Data disalahgunakan untuk penagihan.', incidentDate: '2025-10-05', status: 'verified' as const },
    { perpetratorId: p4.id, reporterId: u1.id, category: 'pinjol' as const, chronology: 'Pinjam Rp 1 juta, diminta bayar Rp 5 juta dalam 7 hari. Debt collector teror keluarga setiap hari.', incidentDate: '2026-01-10', status: 'verified' as const },
    { perpetratorId: p4.id, reporterId: u2.id, category: 'pinjol' as const, chronology: 'Pinjol ilegal memakai identitas perusahaan CIMB Niaga palsu. Biaya admin dipotong 40% dari pinjaman.', incidentDate: '2026-02-01', status: 'verified' as const },
    { perpetratorId: p4.id, reporterId: u3.id, category: 'pinjol' as const, chronology: 'Aplikasi minta akses galeri foto, lalu ancam sebar foto pribadi jika tidak bayar dalam 24 jam.', incidentDate: '2026-02-15', status: 'pending' as const },
    { perpetratorId: p4.id, reporterId: u1.id, category: 'pinjol' as const, chronology: 'Penagihan dengan ancaman kekerasan. DC datang ke rumah korban dan mengancam akan merusak properti.', incidentDate: '2026-02-23', status: 'pending' as const },

    // Rental PS5 Palsu — Penipuan Rental
    { perpetratorId: p5.id, reporterId: u2.id, category: 'other' as const, chronology: 'Rental PS5 online melalui akun Instagram. Bayar sewa Rp 500rb via GoPay, konsol tidak pernah dikirim.', incidentDate: '2025-12-01', status: 'verified' as const },
    { perpetratorId: p5.id, reporterId: u3.id, category: 'other' as const, chronology: 'Sewa kamera mirrorless untuk liburan. Bayar deposit Rp 3 juta via GoPay, barang tidak pernah sampai.', incidentDate: '2026-01-15', status: 'verified' as const },
    { perpetratorId: p5.id, reporterId: u1.id, category: 'other' as const, chronology: 'Rental mobil palsu di media sosial. Transfer DP Rp 1 juta ke GoPay, lalu langsung diblokir.', incidentDate: '2026-02-01', status: 'pending' as const },
  ])

  console.log('✅ 17 reports added')
  console.log('\n🎉 Done! Database now has 10 perpetrators, 47 reports total')
  process.exit(0)
}

addMore().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
