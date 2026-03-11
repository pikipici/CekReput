import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K+`
  return n.toLocaleString('id-ID')
}

// Animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(value)

  useEffect(() => {
    if (value === 0) return

    const startValue = previousValue.current
    const endValue = value
    const duration = 2000 // 2 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out-quart)
      const eased = 1 - Math.pow(1 - progress, 4)

      const currentValue = Math.floor(startValue + (endValue - startValue) * eased)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        previousValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <span>{formatNumber(displayValue)}</span>
}

// Stat card data dengan gradient dan trend
const statCards = [
  {
    key: 'totalReports',
    label: 'stats.reports',
    icon: 'report_problem',
    gradient: 'from-primary/20 via-purple-500/10 to-primary/20',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    borderColor: 'border-primary/30',
    glowColor: 'shadow-primary/20',
    trend: '+15%',
    trendLabel: 'bulan ini',
  },
  {
    key: 'verifiedPerpetrators',
    label: 'stats.perpetrators',
    icon: 'gpp_bad',
    gradient: 'from-amber-500/20 via-rose-500/10 to-amber-500/20',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
    trend: '+8%',
    trendLabel: 'terverifikasi',
  },
  {
    key: 'totalChecks',
    label: 'stats.checks',
    icon: 'search_check',
    gradient: 'from-emerald-500/20 via-primary/10 to-emerald-500/20',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    trend: '+32%',
    trendLabel: 'total cek',
  },
]

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const value = stats[card.key as keyof typeof stats]

          return (
            <div
              key={card.key}
              className={`relative group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.glowColor}`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>

              {/* Glass Panel Overlay */}
              <div className="relative glass-panel p-5 sm:p-8 h-full flex flex-col items-center justify-center text-center">
                {/* Icon dengan floating animation - CENTER & TOP */}
                <div className={`relative ${card.iconBg} ${card.borderColor} border-2 rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className={`material-symbols-outlined ${card.iconColor} text-[32px] sm:text-[40px] group-hover:animate-pulse`}>
                    {card.icon}
                  </span>

                  {/* Glow effect */}
                  <div className={`absolute inset-0 ${card.iconColor} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
                </div>

                {/* Number dengan animasi - CENTER & LARGE */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white tabular-nums tracking-tight drop-shadow-lg">
                    <AnimatedCounter value={value} />
                  </p>
                </div>

                {/* Label - CENTER */}
                <p className="text-sm sm:text-base font-bold text-slate-300 group-hover:text-white transition-colors mb-2">
                  {t(card.label)}
                </p>

                {/* Trend Badge - CENTER */}
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">trending_up</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">{card.trend}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">{card.trendLabel}</span>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`}></div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
