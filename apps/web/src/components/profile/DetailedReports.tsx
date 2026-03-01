import { useState, useMemo, useEffect } from 'react'
import { perpetratorsApi, type Report } from '../../lib/api'

interface ReportData {
  id: string
  username: string
  initial: string
  avatarColor: string
  status: 'verified' | 'pending' | 'rejected'
  dateStr: string
  timestamp: number
  platform: string | null
  lossAmount: string
  content: string
  attachmentsCount: number
  category: string | null
  upvotes: number
}

type FilterType = 'recent' | 'oldest'

interface DetailedReportsProps {
  perpetratorId: string | undefined
}

export default function DetailedReports({ perpetratorId }: DetailedReportsProps) {
  const [filter, setFilter] = useState<FilterType>('recent')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [reports, setReports] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (perpetratorId) {
      setIsLoading(true)
      perpetratorsApi.getReports(perpetratorId)
        .then(({ data }) => {
          if (data && data.reports) {
            // Map the API Report to our component's ReportData representation
            const mapped = data.reports.map((r: Report, idx: number) => {
              const dateObj = new Date(r.createdAt)
              
              // We don't have username from this endpoint by default unless populated,
              // so we generate a consistent anonymous name or use a default.
              const username = 'AnonReporter' + (idx + 1)
              
              return {
                id: r.id,
                username,
                initial: username.substring(0, 2).toUpperCase(),
                avatarColor: 'bg-slate-700', // Default color, could be randomized based on ID
                status: r.status,
                dateStr: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                timestamp: dateObj.getTime(),
                platform: 'Website', // Assuming reported via website for now
                lossAmount: 'Tersembunyi', // Or map from actual data if available
                content: r.chronology,
                attachmentsCount: 0, // Mock for now unless backend provides evidence count
                category: r.category,
                upvotes: 0 // Mock for now unless backend provides report upvotes
              } as ReportData
            })
            setReports(mapped)
          }
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [perpetratorId])

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      if (filter === 'recent') {
        return b.timestamp - a.timestamp
      } else {
        return a.timestamp - b.timestamp
      }
    })
  }, [reports, filter])

  const displayedReports = isExpanded ? sortedReports : sortedReports.slice(0, 3)

  if (isLoading) {
    return (
      <section className="animate-pulse">
        <div className="h-10 bg-slate-800 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-40 bg-slate-800 rounded-xl"></div>
          <div className="h-40 bg-slate-800 rounded-xl"></div>
        </div>
      </section>
    )
  }

  if (reports.length === 0) {
    return (
      <section>
        <h3 className="text-xl font-bold text-white mb-4">Laporan Terbaru</h3>
        <div className="glass-panel rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">inbox</span>
          <p className="text-slate-400">Belum ada laporan spesifik yang dapat ditampilkan publik.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Laporan Terbaru</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('recent')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === 'recent' ? 'text-white bg-[#214a42]' : 'text-slate-400 hover:text-white'}`}
          >
            Terbaru
          </button>
          <button 
            onClick={() => setFilter('oldest')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === 'oldest' ? 'text-white bg-[#214a42]' : 'text-slate-400 hover:text-white'}`}
          >
            Terlama
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedReports.map((report) => (
          <article key={report.id} className="glass-panel rounded-xl p-5 hover:bg-card-hover/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${report.avatarColor.startsWith('bg-') ? report.avatarColor : `bg-gradient-to-br ${report.avatarColor}`}`}>
                  {report.initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{report.username}</p>
                    {report.status === 'verified' ? (
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-primary/20">
                        <span className="material-symbols-outlined text-[12px]">verified</span> TERVERIFIKASI
                      </span>
                    ) : report.status === 'pending' ? (
                      <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-yellow-500/20">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> MENUNGGU TINJAUAN
                      </span>
                    ) : (
                      <span className="bg-danger/20 text-danger text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-danger/20">
                        <span className="material-symbols-outlined text-[12px]">cancel</span> DITOLAK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {report.dateStr} {report.platform && `• Dilaporkan via ${report.platform}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-danger font-bold text-sm">-{report.lossAmount}</p>
                <p className="text-xs text-slate-400">Total Kerugian</p>
              </div>
            </div>

            <div className="bg-background-dark/40 rounded-lg p-3 mb-3 border border-white/5">
              <p className="text-sm text-slate-200 leading-relaxed">
                "{report.content}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-3">
              {report.attachmentsCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
                  <span className="material-symbols-outlined text-[16px]">attachment</span>
                  {report.attachmentsCount} Tangkapan Layar Terlampir
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">image_not_supported</span>
                  Tidak Ada Bukti Publik
                </div>
              )}
              
              {report.category && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  Kategori: {report.category}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {sortedReports.length > 3 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-6 py-3 border border-[#214a42] text-primary hover:bg-[#214a42]/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isExpanded ? 'Tampilkan Lebih Sedikit' : `Lihat Semua ${sortedReports.length} Laporan`}
          <span className="material-symbols-outlined text-[16px]">
            {isExpanded ? 'arrow_upward' : 'arrow_downward'}
          </span>
        </button>
      )}
    </section>
  )
}
