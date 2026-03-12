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
  const [activeTab, setActiveTab] = useState<'recent' | 'related'>('recent')
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [reports, setReports] = useState<ReportData[]>([])
  const [relatedReports, setRelatedReports] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!perpetratorId) {
      setIsLoading(false)
      return
    }
    
    let mounted = true
    setIsLoading(true)
    
    Promise.all([
      perpetratorsApi.getReports(perpetratorId),
      perpetratorsApi.getRelatedReports(perpetratorId)
    ]).then(([reportsRes, relatedRes]) => {
      if (mounted) {
        if (reportsRes.data && reportsRes.data.reports) {
            const mapped = reportsRes.data.reports.map((r: Report, idx: number) => {
              const dateObj = new Date(r.createdAt)
              const username = 'AnonReporter' + (idx + 1)
              return {
                id: r.id,
                username,
                initial: username.substring(0, 2).toUpperCase(),
                avatarColor: 'bg-slate-700',
                status: r.status,
                dateStr: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                timestamp: dateObj.getTime(),
                platform: 'Website',
                lossAmount: 'Tersembunyi',
                content: r.chronology,
                attachmentsCount: 0,
                category: r.category,
                upvotes: 0
              } as ReportData
            })
            setReports(mapped)
        }

        if (relatedRes.data && relatedRes.data.reports) {
            const mappedRelated = relatedRes.data.reports.map((r: Report, idx: number) => {
              const dateObj = new Date(r.createdAt)
              const username = 'RelatedReporter' + (idx + 1)
              return {
                id: r.id,
                username,
                initial: username.substring(0, 2).toUpperCase(),
                avatarColor: 'bg-indigo-700', // Different color for related
                status: r.status,
                dateStr: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                timestamp: dateObj.getTime(),
                platform: 'Website',
                lossAmount: 'Tersembunyi',
                content: r.chronology,
                attachmentsCount: 0,
                category: r.category,
                upvotes: 0
              } as ReportData
            })
            setRelatedReports(mappedRelated)
        }

        setIsLoading(false)
      }
    }).catch(() => {
      if (mounted) setIsLoading(false)
    })
    
    return () => {
      mounted = false
    }
  }, [perpetratorId])

  const currentData = activeTab === 'recent' ? reports : relatedReports

  const sortedReports = useMemo(() => {
    return [...currentData].sort((a, b) => {
      if (filter === 'recent') {
        return b.timestamp - a.timestamp
      } else {
        return a.timestamp - b.timestamp
      }
    })
  }, [currentData, filter])

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

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex bg-background-dark/50 p-1 rounded-xl border border-white/5 w-fit max-w-full overflow-x-auto hide-scrollbar whitespace-nowrap">
          <button
            onClick={() => { setActiveTab('recent'); setIsExpanded(false); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'recent'
                ? 'bg-[#214a42] text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Laporan Terbaru
          </button>
          <button
            onClick={() => { setActiveTab('related'); setIsExpanded(false); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'related'
                ? 'bg-[#214a42] text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Info Terkait
            {relatedReports.length > 0 && (
              <span className="bg-primary text-background-dark text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {relatedReports.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 shrink-0">
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

      {currentData.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">
            {activeTab === 'recent' ? 'inbox' : 'link_off'}
          </span>
          <p className="text-slate-400">
            {activeTab === 'recent' 
              ? 'Belum ada laporan spesifik yang dapat ditampilkan publik.' 
              : 'Tidak ada info/laporan terkait dari database yang memiliki kesamaan data profil pelaku.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReports.map((report) => (
            <article key={report.id} className="glass-panel rounded-xl p-4 sm:p-5 hover:bg-card-hover/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
                
                {/* Bagian Profil Kiri */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm ${report.avatarColor.startsWith('bg-') ? report.avatarColor : `bg-gradient-to-br ${report.avatarColor}`}`}>
                    {report.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white truncate max-w-full">{report.username}</p>
                      {report.status === 'verified' ? (
                        <span className="bg-primary/20 text-primary text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-primary/20 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[10px] sm:text-[11px]">verified</span> TERVERIFIKASI
                        </span>
                      ) : report.status === 'pending' ? (
                        <span className="bg-yellow-500/20 text-yellow-500 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-yellow-500/20 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[10px] sm:text-[11px]">schedule</span> TINJAUAN
                        </span>
                      ) : (
                        <span className="bg-danger/20 text-danger text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-danger/20 whitespace-nowrap">
                          <span className="material-symbols-outlined text-[10px] sm:text-[11px]">cancel</span> DITOLAK
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">
                      {report.dateStr} {report.platform && `• via ${report.platform}`}
                    </p>

                    {/* Total Kerugian Khusus Mobile (Muncul di bawah username, sejajar dengan teks) */}
                    <div className="mt-2 block sm:hidden">
                      <div className="inline-flex flex-col bg-danger/10 px-2.5 py-1.5 rounded-lg border border-danger/20">
                        <p className="text-danger font-bold text-xs">-{report.lossAmount}</p>
                        <p className="text-[9px] text-danger/80">Total Kerugian</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Kerugian Khusus Desktop (Muncul di kanan) */}
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-danger font-bold text-sm">-{report.lossAmount}</p>
                  <p className="text-xs text-slate-400">Total Kerugian</p>
                </div>
              </div>

              <div className="bg-background-dark/40 rounded-lg p-3 mb-3 border border-white/5">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "{report.content}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t border-white/5 pt-3">
                {report.attachmentsCount > 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-primary font-medium cursor-pointer hover:underline">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">attachment</span>
                    {report.attachmentsCount} Tangkapan Layar Terlampir
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">image_not_supported</span>
                    Tidak Ada Bukti Publik
                  </div>
                )}
                
                {report.category && (
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px] sm:text-[16px]">category</span>
                    Kategori: {report.category}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

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
