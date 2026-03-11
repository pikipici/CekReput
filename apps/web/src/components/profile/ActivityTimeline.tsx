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

      <div className="space-y-3 sm:space-y-4">
        {timelineData.map((item, index) => {
          const categoryClass = categoryColors[item.category] || categoryColors.other
          const status = statusConfig[item.status]
          const categoryLabel = categoryLabels[item.category] || item.category

          return (
            <div
              key={item.id}
              className={`relative pl-6 sm:pl-8 pb-4 sm:pb-6 ${index !== timelineData.length - 1 ? 'border-l-2 border-slate-700' : 'border-l-2 border-slate-700'} last:pb-0`}
            >
              {/* Timeline Dot - Larger */}
              <div className="absolute left-[-6px] sm:left-[-7px] top-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary border-4 border-background-dark"></div>

              {/* Date - Larger Text */}
              <div className="text-[11px] sm:text-xs text-slate-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">calendar_today</span>
                {formatDate(item.createdAt)}
              </div>

              {/* Content Card - Clickable - Better Padding */}
              <div
                className="glass-panel rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => onReportClick?.(item)}
              >
                {/* Badges - Larger Text */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                  <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${categoryClass}`}>
                    {categoryLabel}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${status.color}`}>
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px]">{status.icon}</span>
                    {status.label}
                  </span>
                </div>

                {/* Chronology Preview - Larger Text */}
                <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed mb-2.5 sm:mb-3 line-clamp-2">
                  {item.chronology}
                </p>

                {/* Loss Amount (if exists) - Larger Text */}
                {item.lossAmount && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px]">payments</span>
                    <span className="font-medium text-slate-300">
                      Kerugian: {formatCurrency(item.lossAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
