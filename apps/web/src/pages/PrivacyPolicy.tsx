import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - Kebijakan Privasi"
        description="Kebijakan privasi CekReput. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda."
        keywords="privacy policy, kebijakan privasi, perlindungan data pribadi, UU PDP, cekreput"
        canonical="https://cekreput.com/privacy-policy"
      />
      <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-background-dark">
      <Header />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali ke Beranda
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[28px]">privacy_tip</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-lg text-slate-400">Kebijakan Privasi</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-slate-500">Versi: 1.0</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-500">Tanggal Berlaku: 27 Februari 2026</span>
            </div>
          </div>

          {/* Introduction */}
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <p className="text-slate-300 leading-relaxed">
              Kebijakan Privasi ini menjelaskan bagaimana <span className="text-primary font-semibold">CekReput</span> mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan platform kami.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">folder_open</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">1. Data yang Kami Kumpulkan</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Kami mengumpulkan dua kategori data:
                  </p>
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                        Data Pelapor:
                      </h3>
                      <p className="text-slate-300">
                        Nama pengguna, alamat email, alamat IP, dan log aktivitas saat Anda mengirimkan laporan.
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">assignment</span>
                        Data Terlapor (Subjek):
                      </h3>
                      <p className="text-slate-300">
                        Nomor rekening bank, nomor telepon, nama lengkap (yang dilaporkan oleh pengguna lain), kronologi kejadian, serta bukti transaksi/chat yang diunggah oleh Pelapor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">fact_check</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">2. Tujuan Pengolahan Data</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Data pribadi yang dikumpulkan digunakan untuk:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Memberikan informasi kewaspadaan bagi masyarakat terhadap potensi penipuan.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Memastikan akuntabilitas laporan sehingga platform tidak digunakan untuk fitnah.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Melakukan verifikasi atas bukti-bukti yang diunggah sebelum dipublikasikan.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Mematuhi kewajiban hukum jika terdapat permintaan dari pihak berwenang.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">3. Keamanan & Penyimpanan Data</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Kami menggunakan standar keamanan teknologi terkini (seperti <span className="text-primary font-medium">enkripsi SSL</span> dan <span className="text-primary font-medium">enkripsi database</span>) untuk melindungi data dari akses yang tidak sah. Data akan disimpan selama informasi tersebut dianggap masih relevan untuk kepentingan publik atau sampai ada permintaan penghapusan yang valid secara hukum.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">share</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">4. Pembagian Data kepada Pihak Ketiga</h2>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-4">
                    <p className="text-emerald-400 flex items-start gap-2">
                      <span className="material-symbols-outlined text-[20px] flex-shrink-0">verified</span>
                      <span>Kami tidak akan menjual data pribadi Anda kepada pihak luar.</span>
                    </p>
                  </div>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Data hanya akan diberikan kepada pihak ketiga jika:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-500 text-[18px] flex-shrink-0 mt-0.5">gavel</span>
                      <div>
                        <span className="text-white font-medium">Aparat Penegak Hukum:</span>
                        <span className="text-slate-300"> Jika ada permintaan resmi (surat tugas/perintah pengadilan) terkait proses penyidikan.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-500 text-[18px] flex-shrink-0 mt-0.5">cloud</span>
                      <div>
                        <span className="text-white font-medium">Penyedia Layanan Cloud:</span>
                        <span className="text-slate-300"> Seperti Google Cloud Platform (GCP) yang bertindak sebagai penyedia infrastruktur penyimpanan kami.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">5. Hak Anda sebagai Subjek Data (Sesuai UU PDP)</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Berdasarkan UU Pelindungan Data Pribadi, Anda memiliki hak untuk:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <span className="text-slate-300">Mendapatkan informasi mengenai kejelasan identitas dan dasar kepentingan hukum.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">edit</span>
                      <span className="text-slate-300">Melengkapi, memperbarui, atau memperbaiki kesalahan data pribadi Anda (Hak Jawab).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">delete</span>
                      <span className="text-slate-300">Meminta penghapusan data jika data tersebut terbukti tidak akurat atau sengketa telah selesai secara damai.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">visibility_off</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">6. Kebijakan "Masking" (Penyamaran Data)</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Demi melindungi privasi secara proporsional, platform kami menerapkan kebijakan masking pada tampilan publik.
                  </p>
                  <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4 mb-4">
                    <p className="text-slate-300 font-mono text-center">
                      <span className="text-primary">0812-XXXX-1234</span>
                      <span className="text-slate-500 mx-3">atau</span>
                      <span className="text-primary">123-XXXX-789</span>
                    </p>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Data lengkap hanya dapat diakses melalui fitur pencarian yang memerlukan verifikasi tertentu.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">update</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">7. Perubahan Kebijakan</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Setiap perubahan akan diumumkan melalui laman ini dengan memperbarui tanggal <span className="text-primary font-medium">"Terakhir Diperbarui"</span>.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="rounded-2xl p-6 border border-primary/20 bg-primary/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary mb-3">Hubungi Kami</h2>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin menggunakan hak Anda sebagai subjek data, silakan hubungi kami melalui:
                  </p>
                  <a 
                    href="mailto:privacy@cekreput.com" 
                    className="inline-flex items-center gap-2 text-primary hover:text-emerald-400 transition-colors font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">email</span>
                    privacy@cekreput.com
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Home Button */}
          <div className="mt-12 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-background-dark font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  )
}
