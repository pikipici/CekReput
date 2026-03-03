import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TermsOfService() {
  return (
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
                <span className="material-symbols-outlined text-primary text-[28px]">description</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-lg text-slate-400">Ketentuan Layanan</p>
            <p className="text-sm text-slate-500 mt-2">Terakhir Diperbarui: 27 Februari 2026</p>
          </div>

          {/* Introduction */}
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <p className="text-slate-300 leading-relaxed">
              Selamat datang di <span className="text-primary font-semibold">CekReput</span>. Dengan mengakses atau menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui bagian apa pun dari ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Definisi & Ruang Lingkup</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Platform ini adalah wadah informasi independen berbasis komunitas (crowdsourcing) mengenai indikasi tindakan penipuan atau kejahatan finansial lainnya. CekReput bukan merupakan lembaga penegak hukum, biro kredit, atau lembaga peradilan, dan tidak memiliki wewenang untuk mengeluarkan putusan hukum yang mengikat.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Status Informasi & Praduga Tak Bersalah</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">Anda memahami dan menyetujui bahwa:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Seluruh data dalam database ini bersifat "Laporan Pihak Ketiga" atau "Terduga".</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Pencantuman identitas di platform ini tidak otomatis menetapkan seseorang sebagai terpidana atau bersalah secara hukum.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">check_circle</span>
                      <span className="text-slate-300">Informasi ini hanya bertujuan sebagai referensi kewaspadaan dini bagi masyarakat.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Tanggung Jawab Konten (User-Generated Content)</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold mb-2">Tanggung Jawab Pelapor:</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Pengguna yang mengunggah laporan ("Pelapor") bertanggung jawab penuh secara pidana maupun perdata atas kebenaran data, kronologi, dan bukti yang diberikan.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Pelepasan Tanggung Jawab:</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Pengelola Platform tidak menjamin akurasi mutlak dari setiap laporan. Kami tidak bertanggung jawab atas kerugian, tuntutan hukum, atau pencemaran nama baik yang timbul akibat laporan yang tidak akurat dari pengguna.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Standar Bukti & Larangan Penggunaan</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Pelapor wajib melampirkan bukti autentik (seperti tangkapan layar chat atau bukti transfer). Pengguna dilarang keras untuk:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-500 text-[18px] flex-shrink-0 mt-0.5">block</span>
                      <span className="text-slate-300">Memberikan informasi palsu, manipulatif, atau bersifat fitnah.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-500 text-[18px] flex-shrink-0 mt-0.5">block</span>
                      <span className="text-slate-300">Melakukan doxing atau menyebarkan data pribadi yang tidak relevan (seperti foto keluarga).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-rose-500 text-[18px] flex-shrink-0 mt-0.5">block</span>
                      <span className="text-slate-300">Menggunakan platform untuk tujuan pemerasan atau persaingan bisnis tidak sehat.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">5</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Pelindungan Data Pribadi (UU PDP)</h2>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    Platform beroperasi sebagai Penyelenggara Sistem Elektronik (PSE) yang tunduk pada UU PDP:
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold mb-2">Penyamaran Data (Masking):</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Kami berhak menyamarkan sebagian data sensitif pada tampilan publik.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Keterbukaan Informasi:</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Platform akan memberikan data lengkap kepada pihak berwenang (Kepolisian/Kejaksaan) hanya jika terdapat permintaan resmi sesuai hukum yang berlaku.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">6</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Hak Jawab & Kebijakan Penghapusan (Takedown)</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <span className="text-slate-300">Setiap pihak yang keberatan atas pencantuman datanya memiliki <span className="text-primary font-medium">Hak Jawab</span>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <span className="text-slate-300">Kami menyediakan prosedur klarifikasi dengan melampirkan bukti kontra-argumen yang valid.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <span className="text-slate-300">Pengelola berhak menghapus laporan jika terbukti tidak valid atau jika sengketa antar pihak telah diselesaikan secara hukum/damai.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">7</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Batasan Umur & Kecakapan Hukum</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Layanan ini hanya ditujukan bagi individu yang telah berusia minimal <span className="text-primary font-semibold">18 tahun</span> atau sudah menikah dan dianggap cakap dalam melakukan perbuatan hukum menurut peraturan di Indonesia.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">8</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">Hukum yang Berlaku</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Segala perselisihan yang timbul akan diselesaikan melalui musyawarah mufakat, dan jika tidak tercapai, akan diproses melalui wilayah hukum Pengadilan Negeri yang berwenang.
                  </p>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section className="rounded-2xl p-6 border border-amber-500/20 bg-amber-500/10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-[28px]">warning</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-amber-500 mb-3">Pernyataan Penting</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Platform ini disediakan "sebagaimana adanya" tanpa jaminan dalam bentuk apa pun. Penggunaan informasi dari website ini adalah risiko Anda sepenuhnya.
                  </p>
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
  )
}
