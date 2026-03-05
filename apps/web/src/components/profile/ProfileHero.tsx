import { useState, useEffect } from 'react'
import { perpetratorsApi } from '../../lib/api'
import type { Perpetrator, Clarification } from '../../lib/api'
import { Link } from 'react-router-dom'

interface ProfileHeroProps {
  perpetrator: Perpetrator | null
  matchedGameId?: string | null
  matchedGameType?: string | null
}

interface EvidenceFile {
  id: string
  fileUrl: string
  mimeType: string
}

interface VerifiedEvidence {
  id: string
  incidentDate: string
  createdAt: string
  evidenceFiles: EvidenceFile[]
}

export default function ProfileHero({ perpetrator, matchedGameId, matchedGameType }: ProfileHeroProps) {
  const [showAllNames, setShowAllNames] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [verifiedEvidence, setVerifiedEvidence] = useState<VerifiedEvidence[]>([])
  const [clarifications, setClarifications] = useState<Clarification[]>([])
  
  // Modal states
  const [showEvidenceListModal, setShowEvidenceListModal] = useState(false)
  const [selectedReportEvidence, setSelectedReportEvidence] = useState<VerifiedEvidence | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (perpetrator?.id) {
      if (perpetrator.verifiedReports > 0) {
        perpetratorsApi.getVerifiedEvidence(perpetrator.id).then(({ data, error }) => {
          if (!error && data?.verifiedEvidence) {
            setVerifiedEvidence(data.verifiedEvidence.filter(e => e.evidenceFiles.length > 0))
          }
        })
      }
      
      perpetratorsApi.getClarifications(perpetrator.id).then(({ data, error }) => {
        if (!error && data?.clarifications) {
          setClarifications(data.clarifications)
        }
      })
    }
  }, [perpetrator?.id, perpetrator?.verifiedReports])

  if (!perpetrator) {
    return (
      <section className="glass-panel rounded-2xl p-6 lg:p-8 animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl mb-4"></div>
      </section>
    )
  }

  const isBank = perpetrator.accountType === 'bank'
  const isPhone = perpetrator.accountType === 'phone'

  // If there are multiple names saved in entityName (e.g. comma separated), we split them.
  const rawNames = perpetrator.entityName || ''
  const allNames = perpetrator.entityName ? rawNames.split(',').map(n => n.trim()).filter(Boolean) : []
  const displayBankName = matchedGameType || perpetrator.bankName || (isBank ? 'Rekening Bank' : isPhone ? 'Kontak / E-Wallet' : 'Entitas Terlapor')
  
  // Format identifier
  let identifier = matchedGameId || perpetrator.accountNumber || perpetrator.phoneNumber || ''
  if (!matchedGameId && identifier.length > 5) {
    identifier = `${identifier.slice(0, 3)}${'x'.repeat(identifier.length - 6)}${identifier.slice(-3)}`
  }

  const iconName = matchedGameId ? 'sports_esports' : isBank ? 'account_balance' : isPhone ? 'smartphone' : 'storefront'
  
  const isDanger = perpetrator.threatLevel === 'danger'
  const isWarning = perpetrator.threatLevel === 'warning'
  
  const riskColor = isDanger ? 'bg-danger/20 text-danger border-danger/30' : isWarning ? 'bg-warning/20 text-warning border-warning/30' : 'bg-primary/20 text-primary border-primary/30'
  const riskBadgeBg = isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary'
  
  // Estimate loss
  const estLoss = new Intl.NumberFormat('id-ID').format(perpetrator.totalLoss || 0)

  return (
    <>
      <section className="glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden group">
        {/* Decorative Background Element */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isDanger ? 'bg-danger/10' : 'bg-primary/10'} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
          {/* Entity Image / Icon */}
          <div className="shrink-0 relative">
            <div className={`h-32 w-32 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl ${isDanger ? 'bg-danger/10' : 'bg-[#214a42]'}`}>
              <span className="material-symbols-outlined text-6xl text-slate-300">{iconName}</span>
            </div>
            <div className={`absolute -bottom-3 -right-3 ${riskBadgeBg} text-white text-xs font-bold px-3 py-1 rounded-full border-4 border-background-dark shadow-sm flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[16px]">
                {isDanger ? 'warning' : 'check_circle'}
              </span>
              {perpetrator.threatLevel.toUpperCase()}
            </div>
          </div>

          {/* Entity Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col xl:flex-row justify-between items-start gap-4 mb-4">
              {/* Left Side: Identifiers */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-slate-400">
                      {matchedGameId ? 'sports_esports' : isPhone ? 'call' : 'tag'}
                    </span>
                    {identifier}
                  </h1>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${riskColor}`}>
                    {matchedGameId ? 'ID Game' : perpetrator.accountType}
                  </span>
                  {!matchedGameId && <span className="text-[10px] sm:text-xs text-slate-500 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded font-mono">MASKED FOR PRIVACY</span>}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">
                    {isBank ? 'account_balance' : isPhone ? 'smartphone' : 'storefront'}
                  </span>
                  <p className="text-lg text-slate-300 font-medium">
                    {displayBankName}
                  </p>
                  {allNames.length > 0 && (
                    <button 
                      onClick={() => setShowAllNames(!showAllNames)}
                      className="text-xs text-primary hover:text-primary-light bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg ml-2 transition-colors flex items-center gap-1"
                    >
                      {showAllNames ? 'Tutup Daftar' : `+${allNames.length} Nama Terduga Pelaku`}
                      <span className="material-symbols-outlined text-[14px]">
                        {showAllNames ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Right Side: Action & Clarifications */}
              {(isDanger || isWarning) && (
                <div className="shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
                  <Link
                    to={`/clarify/${perpetrator.id}`}
                    className="flex justify-center xl:justify-start items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    Saya Pemilik Data Ini / Ajukan Klarifikasi
                  </Link>
                </div>
              )}
            </div>
              
              {showAllNames && allNames.length > 0 && (
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Teridentifikasi Menggunakan Nama:</p>
                  <div className="flex flex-wrap gap-2">
                    {allNames.map((name, idx) => (
                      <span key={idx} className="text-sm bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
                <p className="text-slate-400 text-xs uppercase font-semibold">Total Laporan</p>
                <p className="text-2xl font-bold text-white mt-1">{perpetrator.totalReports}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 truncate">
                  <span className="material-symbols-outlined text-[14px]">
                    calendar_today
                  </span> 
                  {perpetrator.lastReported ? `Terakhir ${new Date(perpetrator.lastReported).toLocaleDateString('id-ID')}` : 'Belum ada'}
                </p>
              </div>
              <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5 min-w-0">
                <p className="text-slate-400 text-xs uppercase font-semibold truncate" title="Estimasi Kerugian">Estimasi Kerugian</p>
                <div className="flex items-baseline gap-1 mt-1 truncate">
                  <span className="text-xs sm:text-sm font-bold text-slate-400">Rp</span>
                  <span className="text-lg sm:text-xl font-bold text-white tracking-tight" title={estLoss}>{estLoss}</span>
                </div>
              </div>
              <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5 overflow-hidden flex flex-col justify-between">
                <p className="text-slate-400 text-xs uppercase font-semibold leading-tight mb-2">Social Media Terindikasi</p>
                <div>
                  {perpetrator.socialMedia && perpetrator.socialMedia.trim().length > 0 ? (
                    <button 
                      onClick={() => setShowSocialModal(true)}
                      className="w-full text-xs font-medium text-white bg-primary/20 hover:bg-primary/30 border border-primary/30 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      Lihat {perpetrator.socialMedia.split(',').filter(s => s.trim().length > 0).length} Akun
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-slate-500 italic block mt-1">Tidak ada data</span>
                  )}
                </div>
              </div>
              <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-xs uppercase font-semibold">Verifikasi Laporan</p>
                  <span className={`${isDanger ? 'text-danger' : 'text-primary'} font-bold text-lg leading-none`}>
                    {perpetrator.verifiedReports}
                  </span>
                </div>
                
                <div>
                  {verifiedEvidence.length > 0 ? (
                    <button 
                      onClick={() => setShowEvidenceListModal(true)}
                      className="w-full text-xs font-medium text-white bg-[#214a42] hover:bg-[#2a5c52] border border-[#2a5c52]/50 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      Lihat Bukti ({verifiedEvidence.length})
                      <span className="material-symbols-outlined text-[14px]">collections</span>
                    </button>
                  ) : (
                    <div className="w-full text-xs font-medium text-slate-500 bg-slate-800/50 py-1.5 rounded-md text-center italic">
                      Belum Ada Bukti
                    </div>
                  )}
                </div>
              </div>
            </div>

            {clarifications.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified_user</span>
                  Klarifikasi Resmi (Terverifikasi Admin)
                </h3>
                {clarifications.map((c) => (
                  <div key={c.id} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase">{c.relationType || 'Pemilik Sah'}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{c.statement}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Media Modal */}
      {showSocialModal && perpetrator.socialMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="bg-navy-dark border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">link</span>
                Social Media Terindikasi
              </h3>
              <button 
                onClick={() => setShowSocialModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Tutup Modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {perpetrator.socialMedia.split(',').filter(s => s.trim().length > 0).map((sm, idx) => (
                <a 
                  key={idx} 
                  href={sm.trim().startsWith('http') ? sm.trim() : `https://${sm.trim()}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[18px]">public</span>
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white break-all">{sm.trim()}</span>
                  <span className="material-symbols-outlined text-transparent group-hover:text-slate-400 text-[18px] ml-auto">open_in_new</span>
                </a>
              ))}
            </div>
            
            <button 
              onClick={() => setShowSocialModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Evidence List Modal */}
      {showEvidenceListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-sm">
          <div className="bg-navy-dark border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                Bukti Laporan Verifikasi
              </h3>
              <button 
                onClick={() => setShowEvidenceListModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Tutup Modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-4 bg-primary/10 border border-primary/20 p-3 rounded-xl">
              Pilih tanggal laporan untuk melihat bukti gambar atau video spesifik (Data pribadi Pelapor disensor).
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {verifiedEvidence.map((ev, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSelectedReportEvidence(ev)
                    setCurrentImageIndex(0)
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-left group"
                >
                  <div>
                    <span className="text-sm font-bold text-white block mb-1">
                      Insiden: {new Date(ev.incidentDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">attachment</span>
                      {ev.evidenceFiles.length} file bukti
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowEvidenceListModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      )}

      {/* Selected Report Evidence Viewer Modal */}
      {selectedReportEvidence && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background-dark/95 backdrop-blur-md">
          <div className="bg-navy-dark border border-white/10 rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedReportEvidence(null)
                    setShowEvidenceListModal(true)
                  }}
                  className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full flex items-center justify-center"
                  title="Kembali ke Daftar"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">collections</span>
                    Bukti Insiden Penipuan
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Tanggal Kejadian: {new Date(selectedReportEvidence.incidentDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedReportEvidence(null)
                  setShowEvidenceListModal(false)
                }}
                className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full flex items-center justify-center"
                title="Tutup Penampil"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            {/* Image Viewer */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 bg-black/60 overflow-hidden min-h-0">
              {/* Previous Image Button */}
              {selectedReportEvidence.evidenceFiles.length > 1 && (
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedReportEvidence.evidenceFiles.length - 1))}
                  className="absolute left-2 md:left-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-primary text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none ring-2 ring-white/20 hover:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
              )}

              {/* Display Current Media */}
              <div className="relative w-full h-full flex items-center justify-center min-h-0">
                {selectedReportEvidence.evidenceFiles[currentImageIndex].mimeType.startsWith('video/') ? (
                  <video 
                    controls 
                    className="w-auto h-auto max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10 object-contain"
                    src={selectedReportEvidence.evidenceFiles[currentImageIndex].fileUrl}
                  />
                ) : (
                  <img 
                    className="w-auto h-auto max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10 object-contain transition-transform duration-300 pointer-events-none select-none"
                    src={selectedReportEvidence.evidenceFiles[currentImageIndex].fileUrl}
                    alt={`Bukti Laporan ${currentImageIndex + 1}`}
                  />
                )}
                
                {/* Watermark/Disclaimer */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background-dark/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 flex items-center gap-2 w-max max-w-[90%] md:max-w-max text-center z-20 shadow-lg pointer-events-none">
                  <span className="material-symbols-outlined text-warning text-[18px]">verified_user</span>
                  <span className="text-xs md:text-sm font-medium text-slate-200">Bukti Verifikasi CekReput. Data pribadi disensor.</span>
                </div>
              </div>

              {/* Next Image Button */}
              {selectedReportEvidence.evidenceFiles.length > 1 && (
                <button 
                  onClick={() => setCurrentImageIndex((prev) => (prev < selectedReportEvidence.evidenceFiles.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-primary text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none ring-2 ring-white/20 hover:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              )}
            </div>

            {/* Thumbnails Footer */}
            {selectedReportEvidence.evidenceFiles.length > 1 && (
              <div className="h-28 bg-slate-900 border-t border-white/5 flex items-center justify-center gap-3 px-4 overflow-x-auto shrink-0 py-4">
                {selectedReportEvidence.evidenceFiles.map((ev, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative h-20 w-20 md:w-28 shrink-0 rounded-lg overflow-hidden border-2 transition-all opacity-70 hover:opacity-100 ${
                      currentImageIndex === idx ? 'border-primary ring-2 ring-primary/40 opacity-100 scale-105 shadow-lg' : 'border-transparent'
                    }`}
                  >
                    {ev.mimeType.startsWith('video/') ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">play_circle</span>
                      </div>
                    ) : (
                      <img src={ev.fileUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  )
}
