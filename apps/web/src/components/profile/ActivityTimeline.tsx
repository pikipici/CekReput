import { useEffect, useState } from 'react'
import { perpetratorsApi } from '../../lib/api'

interface ActivityTimelineProps {
  perpetratorId?: string
  onReportClick?: (report: {
    id: string
    category: string
    status: string
    incidentDate: string
    createdAt: string
    chronology: string
    lossAmount?: number | null
  }) => void
}

interface TimelineItem {
  id: string
  category: string
  status: string
  incidentDate: string
  createdAt: string
  chronology: string
  lossAmount?: number | null
}

const categoryColors: Record<string, string> = {
  marketplace: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  investasi: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  pinjol: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  phishing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cod: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  lowker: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  romance: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  hackback: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  verified: { label: 'Terverifikasi', color: 'text-emerald-400', icon: 'check_circle' },
  pending: { label: 'Menunggu Review', color: 'text-amber-400', icon: 'pending' },
  rejected: { label: 'Ditolak', color: 'text-rose-400', icon: 'cancel' },
}

const categoryLabels: Record<string, string> = {
  marketplace: 'Marketplace',
  investasi: 'Investasi',
  pinjol: 'Pinjol',
  phishing: 'Phishing',
  cod: 'COD',
  lowker: 'Lowker',
  romance: 'Romance',
  hackback: 'Hackback',
  other: 'Lainnya',
}

export default function ActivityTimeline({ perpetratorId, onReportClick }: ActivityTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!perpetratorId) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    perpetratorsApi.getTimeline(perpetratorId).then((res) => {
      const timelineRes = res.data as { timeline?: TimelineItem[] } | undefined
      if (mounted && timelineRes?.timeline) {
        setTimelineData(timelineRes.timeline)
      }
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [perpetratorId])

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <section className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">history</span>
          Riwayat Aktivitas Laporan
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-24 h-6 bg-slate-800 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (timelineData.length === 0) {
    return (
      <section className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">history</span>
          Riwayat Aktivitas Laporan
        </h3>
        <div className="h-32 flex flex-col items-center justify-center text-slate-500">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
          <p className="text-sm">Belum ada riwayat laporan</p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass-panel rounded-2xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4 sm:mb-6">
        <span className="material-symbols-outlined text-primary text-[20px] sm:text-[22px]">history</span>
        Riwayat Aktivitas Laporan
      </h3>

      <div className="space-y-0">
        {timelineData.map((item, index) => {
          const categoryClass = categoryColors[item.category] || categoryColors.other
          const status = statusConfig[item.status]
          const categoryLabel = categoryLabels[item.category] || item.category

          return (
            <div
              key={item.id}
              className={`relative pl-8 sm:pl-10 py-4 sm:py-5 group cursor-pointer ${
                index !== timelineData.length - 1 ? 'border-b border-white/5' : ''
              }`}
              onClick={() => onReportClick?.(item)}
            >
              {/* Timeline Thread Line */}
              {index !== timelineData.length - 1 && (
                <div className="absolute left-[9px] sm:left-[11px] top-10 bottom-[-1.25rem] w-[2px] bg-slate-800"></div>
              )}

              {/* Timeline Dot with Glow */}
              <div className="absolute left-0 sm:left-1 top-5 sm:top-6 w-[20px] h-[20px] rounded-full bg-background-dark border-[3px] border-primary z-10 shadow-[0_0_8px_rgba(5,217,168,0.5)] group-hover:scale-110 transition-transform"></div>

              {/* Hover Background Layer */}
              <div className="absolute inset-x-0 inset-y-1 -left-4 rounded-xl transition-colors duration-300 group-hover:bg-card-hover/40 -z-10 pointer-events-none"></div>

              {/* Header Row: Date & Loss */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-slate-400">calendar_today</span>
                    {formatDate(item.createdAt)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border ${categoryClass}`}>
                    {categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                   {item.lossAmount && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-danger bg-danger/10 px-2 py-1 rounded-lg border border-danger/20">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      -{formatCurrency(item.lossAmount)}
                    </div>
                  )}
                  <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md border border-current ${status.color} bg-current/10`}>
                    <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
                    <span className="hidden sm:inline">{status.label}</span>
                  </span>
                </div>
              </div>

              {/* Body: Chronology */}
              {item.chronology && item.chronology.trim() !== '' && (
                <div className="pr-4 sm:pr-8">
                  <p className="text-[12px] sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-1 italic">
                    "{item.chronology}"
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
