import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/results?q=${encodeURIComponent(q)}`)
  }

  return (
    <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto w-full">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-xs font-semibold text-primary tracking-wide uppercase">Live Database Protection</span>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
        Cek <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Rekening &amp; Telepon</span><br />Sebelum Bertransaksi
      </h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Database penipuan terlengkap berbasis komunitas di Indonesia. Lindungi diri Anda dari penipuan online dengan memverifikasi identitas penjual.
      </p>

      {/* Search Component */}
      <div className="w-full max-w-3xl mx-auto relative group">
        {/* Search Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-panel rounded-2xl p-2 sm:p-3 shadow-2xl dark:shadow-2xl shadow-slate-200">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
            {/* Type Selector  */}
            <div className="relative min-w-[140px]">
              <select className="w-full h-12 sm:h-14 pl-10 pr-8 bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xl focus:ring-primary focus:border-primary appearance-none cursor-pointer">
                <option>Semua</option>
                <option>Rekening Bank</option>
                <option>E-Wallet</option>
                <option>Nomor Telepon</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">filter_list</span>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[24px]">search</span>
              <input
                className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Masukkan nomor rekening, e-wallet, atau telepon..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Action Button */}
            <button
              className="h-12 sm:h-14 px-8 bg-primary hover:bg-primary-dark text-background-dark font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
              type="submit"
              disabled={!query.trim()}
            >
              <span>Cek Sekarang</span>
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Helper Text */}
        <div className="flex justify-center items-center gap-6 mt-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span> Data Terverifikasi</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-500">lock</span> Privasi Aman</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-500">update</span> Update Real-time</span>
        </div>
      </div>
    </section>
  )
}
