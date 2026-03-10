import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K+`
  return n.toLocaleString('id-ID')
}

export default function Stats() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({ totalReports: 0, verifiedPerpetrators: 0, totalChecks: 0 })

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        {/* Stat Card 1 */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-800/50 transition-colors cursor-default group">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">report_problem</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">{t('stats.reports')}</p>
            <p className="text-xl sm:text-3xl font-bold text-white tabular-nums tracking-tight truncate">
              {formatNumber(stats.totalReports)}
            </p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-800/50 transition-colors cursor-default group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform relative z-10">
            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">gpp_bad</span>
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">{t('stats.perpetrators')}</p>
            <p className="text-xl sm:text-3xl font-bold text-amber-400 tabular-nums tracking-tight drop-shadow-sm truncate">
              {formatNumber(stats.verifiedPerpetrators)}
            </p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:bg-slate-800/50 transition-colors cursor-default group">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">search_check</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">{t('stats.checks')}</p>
            <p className="text-xl sm:text-3xl font-bold text-white tabular-nums tracking-tight truncate">
              {formatNumber(stats.totalChecks)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
