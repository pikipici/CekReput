import { useEffect, useState } from 'react'
import { perpetratorsApi, type EvidenceFile } from '../../lib/api'

interface ActivityTimelineProps {
  perpetratorId?: string
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

export default function ActivityTimeline({ perpetratorId }: ActivityTimelineProps) {
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

  // Modal state
  const [selectedReport, setSelectedReport] = useState<TimelineItem | null>(null)
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Fetch evidence when report is selected
  useEffect(() => {
    if (!selectedReport || !perpetratorId) return
    setEvidenceLoading(true)
    perpetratorsApi.getVerifiedEvidence(perpetratorId).then((res) => {
      if (res.data?.verifiedEvidence) {
        const reportEvidence = res.data.verifiedEvidence.find(e => e.id === selectedReport.id)
        setEvidence((reportEvidence?.evidenceFiles || []) as EvidenceFile[])
      }
      setEvidenceLoading(false)
    })
  }, [selectedReport, perpetratorId])

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReport(null)
        setSelectedImage(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

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
    <section className="glass-panel rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">history</span>
        Riwayat Aktivitas Laporan
      </h3>

      <div className="space-y-4">
        {timelineData.map((item, index) => {
          const categoryClass = categoryColors[item.category] || categoryColors.other
          const status = statusConfig[item.status]
          const categoryLabel = categoryLabels[item.category] || item.category

          return (
            <div
              key={item.id}
              className={`relative pl-8 pb-6 ${index !== timelineData.length - 1 ? 'border-l-2 border-slate-700' : 'border-l-2 border-slate-700'} last:pb-0`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background-dark"></div>

              {/* Date */}
              <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {formatDate(item.createdAt)}
              </div>

              {/* Content Card - Clickable */}
              <div
                className="glass-panel rounded-xl p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(item)}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryClass}`}>
                    {categoryLabel}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                    {status.label}
                  </span>
                </div>

                {/* Chronology Preview */}
                <p className="text-sm text-slate-300 leading-relaxed mb-3 line-clamp-2">
                  {item.chronology}
                </p>

                {/* Loss Amount (if exists) */}
                {item.lossAmount && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">payments</span>
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-navy-dark border border-slate-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Detail Laporan
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 h-9 w-9 rounded-lg flex items-center justify-center transition-colors"
                title="Tutup Modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Report Info */}
            <div className="space-y-4 mb-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${categoryColors[selectedReport.category] || categoryColors.other}`}>
                  {categoryLabels[selectedReport.category] || selectedReport.category}
                </span>
                <span className={`flex items-center gap-1 text-sm font-medium ${statusConfig[selectedReport.status].color}`}>
                  <span className="material-symbols-outlined text-[16px]">{statusConfig[selectedReport.status].icon}</span>
                  {statusConfig[selectedReport.status].label}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>Dilaporkan: {formatDate(selectedReport.createdAt)}</span>
              </div>

              {/* Chronology */}
              <div className="glass-panel rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Kronologi:</h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.chronology}
                </p>
              </div>

              {/* Loss Amount */}
              {selectedReport.lossAmount && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">payments</span>
                  <span className="text-slate-400">Kerugian:</span>
                  <span className="font-bold text-white">{formatCurrency(selectedReport.lossAmount)}</span>
                </div>
              )}
            </div>

            {/* Evidence Section */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">collections</span>
                Bukti Terverifikasi ({evidence.length})
              </h4>

              {evidenceLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : evidence.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {evidence.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(file.fileUrl)}
                    >
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.fileUrl}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : file.mimeType.startsWith('video/') ? (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-slate-400">movie</span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-slate-400">description</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                          {file.mimeType.startsWith('image/') ? 'Foto' : file.mimeType.startsWith('video/') ? 'Video' : 'Dokumen'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                  <p className="text-sm">Belum ada bukti terverifikasi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 h-12 w-12 rounded-full flex items-center justify-center transition-colors z-10"
            title="Tutup"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <img
            src={selectedImage}
            alt="Evidence"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
