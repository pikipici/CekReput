import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { perpetratorsApi, type Perpetrator, type EvidenceFile } from '../lib/api'
import ProfileNavbar from '../components/profile/ProfileNavbar'
import ProfileHero from '../components/profile/ProfileHero'
import ActivityTimeline from '../components/profile/ActivityTimeline'
import DetailedReports from '../components/profile/DetailedReports'
import CommunityDiscussion from '../components/profile/CommunityDiscussion'
import ProfileFooter from '../components/profile/ProfileFooter'
import SEO from '../components/SEO'

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [perpetrator, setPerpetrator] = useState<Perpetrator | null>(null)
  
  // Modal state
  const [selectedReport, setSelectedReport] = useState<{
    id: string
    category: string
    status: string
    incidentDate: string
    createdAt: string
    chronology: string
    lossAmount?: number | null
  } | null>(null)
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const matchedGameId = searchParams.get('gameId')
  const matchedGameType = searchParams.get('gameType')

  useEffect(() => {
    if (id) {
      perpetratorsApi.getById(id).then(({ data, error }) => {
        if (!error && data?.perpetrator) {
          setPerpetrator(data.perpetrator)
        }
      })
    }
  }, [id])

  const displayName = perpetrator
    ? (matchedGameId || perpetrator.bankName || perpetrator.entityName || perpetrator.accountNumber || perpetrator.phoneNumber || 'Unknown')
    : 'Memuat Profil...'

  const threatLevelText = perpetrator?.threatLevel === 'danger' ? 'Bahaya' : perpetrator?.threatLevel === 'warning' ? 'Waspada' : 'Aman'

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

  // Fetch evidence when report is selected
  useEffect(() => {
    if (!selectedReport || !id) return
    setEvidenceLoading(true)
    perpetratorsApi.getVerifiedEvidence(id).then((res) => {
      if (res.data?.verifiedEvidence) {
        const reportEvidence = res.data.verifiedEvidence.find(e => e.id === selectedReport.id)
        setEvidence((reportEvidence?.evidenceFiles || []) as EvidenceFile[])
      }
      setEvidenceLoading(false)
    })
  }, [selectedReport, id])

  return (
    <>
      <SEO
        title={`${displayName} - ${threatLevelText || 'Profil'}`}
        description={perpetrator ? `Profil ${displayName}: ${perpetrator.totalReports} laporan, ${perpetrator.verifiedReports} terverifikasi. Tingkat ancaman: ${threatLevelText}. Lihat detail laporan penipuan di CekReput.` : 'Lihat profil detail laporan penipuan di CekReput'}
        keywords={`profil ${displayName}, laporan penipuan, ${perpetrator?.accountType || 'rekening'} penipu, database penipuan`}
        canonical={`https://cekreput.com/profile/${id}`}
        ogType="profile"
      />
      <div className="bg-background-dark font-display text-slate-100 antialiased min-h-screen flex flex-col">
        <ProfileNavbar />

        <main className="flex-grow container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <Link className="hover:text-primary" to="/results">Laporan</Link>
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">chevron_right</span>
            <span className="text-white font-medium truncate">{displayName}</span>
          </div>

          {/* Profile Hero */}
          <ProfileHero
            perpetrator={perpetrator}
            matchedGameId={matchedGameId}
            matchedGameType={matchedGameType}
          />

          {/* Activity Timeline (Simple List) */}
          <ActivityTimeline
            perpetratorId={id}
            onReportClick={(report) => setSelectedReport(report)}
          />

          {/* Detailed Reports */}
          <DetailedReports perpetratorId={id} />

          {/* Community Discussion */}
          <CommunityDiscussion />
        </main>

        <ProfileFooter />

        {/* Report Detail Modal - Root Level */}
        {selectedReport && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="bg-navy-dark border border-slate-700 rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative"
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
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    {selectedReport.category}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    selectedReport.status === 'verified' ? 'text-emerald-400' :
                    selectedReport.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {selectedReport.status === 'verified' ? 'check_circle' :
                       selectedReport.status === 'pending' ? 'pending' : 'cancel'}
                    </span>
                    {selectedReport.status === 'verified' ? 'Terverifikasi' :
                     selectedReport.status === 'pending' ? 'Menunggu Review' : 'Ditolak'}
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

        {/* Image Lightbox - Root Level */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-colors z-10"
              title="Tutup"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">close</span>
            </button>
            <img
              src={selectedImage}
              alt="Evidence"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </>
  )
}
