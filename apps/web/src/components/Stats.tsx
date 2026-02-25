import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K+`
  return n.toLocaleString('id-ID')
}

export default function Stats() {
  const [stats, setStats] = useState({ totalReports: 0, verifiedPerpetrators: 0, totalChecks: 0 })

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Stat Card 1 */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default group">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]">report_problem</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Laporan Masuk</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatNumber(stats.totalReports)}
            </p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default group">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]">gpp_bad</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Penipu Terverifikasi</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatNumber(stats.verifiedPerpetrators)}
            </p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default group">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]">search_check</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengecekan</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatNumber(stats.totalChecks)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
