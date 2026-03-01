import { useState, useEffect } from 'react'
import JSZip from 'jszip'
import saveAs from 'file-saver'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'
import FileUploader from '../../components/report/FileUploader'
import type { UploadedFile } from '../../components/report/FileUploader'

interface PendingReport {
  id: string
  perpetratorId: string
  reporterId: string
  category: string
  chronology: string
  incidentDate: string
  status: string
  lossAmount?: number | null
  createdAt: string
  evidenceLink?: string | null
  perpetrator?: {
    accountNumber: string
    phoneNumber: string
    entityName: string
    bankName: string
    socialMedia: string | null
  } | null
  evidenceFiles?: {
    id: string
    fileUrl: string
    fileName: string
    mimeType: string
  }[]
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const categoryLabels: Record<string, string> = {
  marketplace: 'Penipuan Marketplace',
  investment: 'Investasi Bodong',
  loan: 'Pinjaman Online Ilegal',
  phishing: 'Phishing / Social Engineering',
  cod: 'COD Fiktif',
  job: 'Penipuan Lowongan Kerja',
  romance: 'Romance Scam',
  other: 'Lainnya',
}

export default function ModerationPage() {
  const { token } = useAuth()
  const [reports, setReports] = useState<PendingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [viewReport, setViewReport] = useState<PendingReport | null>(null)
  const [verifyReport, setVerifyReport] = useState<PendingReport | null>(null)
  const [verifyEvidence, setVerifyEvidence] = useState<UploadedFile[]>([])

  const fetchPending = () => {
    if (!token) return
    setLoading(true)
    const limit = 10
    fetch(`${API_BASE}/api/moderation/pending?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.reports) setReports(data.reports)
        if (data.total != null) setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPending() }, [token, page])

  const handleVerify = async (id: string, evidenceFiles: UploadedFile[] = []) => {
    setActionLoading(id)
    try {
      await fetch(`${API_BASE}/api/moderation/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'verify', evidenceFiles }),
      })
      setReports(r => r.filter(rep => rep.id !== id))
    } catch {}
    setActionLoading(null)
    setVerifyReport(null)
    setVerifyEvidence([])
  }

  const handleDownloadEvidence = async (report: PendingReport) => {
    if (report.evidenceFiles && report.evidenceFiles.length > 0) {
      setDownloadingId(report.id)
      
      try {
        if (report.evidenceFiles.length > 1) {
          const zip = new JSZip()
          // Use safe characters for folder/zip name
          const perpName = report.perpetrator?.entityName ? report.perpetrator.entityName.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown'
          const folderName = `Bukti_${perpName}_${report.id.substring(0,8)}`
          const folder = zip.folder(folderName)
          
          let successCount = 0;
          for (let i = 0; i < report.evidenceFiles.length; i++) {
            const file = report.evidenceFiles[i]
            const isAbsolute = file.fileUrl.startsWith('http://') || file.fileUrl.startsWith('https://')
            const isLocalUpload = file.fileUrl.startsWith('/uploads/')

            let downloadUrl = ''
            if (isAbsolute) {
              // Try to bypass CORS using a public proxy to enable JSZip to read external storage bytes (since R2 doesn't have CORS setup here)
              downloadUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(file.fileUrl)}`
            } else {
              const targetPath = file.fileUrl.startsWith('/') ? file.fileUrl : (isLocalUpload ? file.fileUrl : `/uploads/evidence/${file.fileUrl}`)
              downloadUrl = `${window.location.protocol}//${window.location.host}${targetPath}`
            }

            try {
              const response = await fetch(downloadUrl)
              if (!response.ok) throw new Error(`HTTP ${response.status}`)
              const blob = await response.blob()
              
              // Ensure unique filenames within ZIP in case users upload multiple files with the same original name
              folder?.file(`${i+1}_${file.fileName}`, blob)
              successCount++;
            } catch (err) {
              console.error(`Failed to fetch ${downloadUrl} for ZIP:`, err)
            }
          }
          
          if (successCount === 0) {
            // Failed to fetch any files (likely CORS block by R2 or ISP block). Fallback to Detail opening.
            setViewReport(report);
            alert('Gagal mengompresi bukti menjadi ZIP (kemungkinan masalah jaringan/CORS). Silakan buka bukti secara manual pada panel Detail ini.');
          } else {
            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, `${folderName}.zip`)
            
            if (successCount < report.evidenceFiles.length) {
              alert(`Hanya ${successCount} dari ${report.evidenceFiles.length} file yang berhasil dimasukkan ke dalam ZIP. Sisanya diblokir oleh jaringan Anda.`)
            }
          }
        } else {
          // Standard single-file direct tab opening without JSZip processing
          for (const file of report.evidenceFiles) {
            const isAbsolute = file.fileUrl.startsWith('http://') || file.fileUrl.startsWith('https://')
            const isLocalUpload = file.fileUrl.startsWith('/uploads/')

            if (isAbsolute) {
              window.open(file.fileUrl, '_blank')
            } else {
              const targetPath = file.fileUrl.startsWith('/') ? file.fileUrl : (isLocalUpload ? file.fileUrl : `/uploads/evidence/${file.fileUrl}`)
              const localUrl = `${window.location.protocol}//${window.location.host}${targetPath}`
              window.open(localUrl, '_blank')
            }
          }
        }
      } catch (error) {
        console.error('Download error:', error)
        alert('Gagal membuka/mengunduh file bukti.')
      } finally {
        setTimeout(() => setDownloadingId(null), 500)
      }
    }
  }

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return
    setActionLoading(rejectId)
    try {
      await fetch(`${API_BASE}/api/moderation/reports/${rejectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject', rejectionReason: rejectReason }),
      })
      setReports(r => r.filter(rep => rep.id !== rejectId))
    } catch {}
    setRejectId(null)
    setRejectReason('')
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Moderasi Laporan</h1>
          <p className="text-sm text-slate-400 mt-1">Review dan verifikasi laporan masuk</p>
        </div>
        <span className="text-sm text-slate-400 tabular-nums">{total} laporan pending</span>
      </div>

      {/* Reports Queue */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="material-symbols-outlined text-emerald-400 text-5xl mb-3">task_alt</span>
          <p className="text-lg font-semibold text-white">Semua laporan sudah dimoderasi!</p>
          <p className="text-sm text-slate-400 mt-1">Tidak ada laporan pending saat ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, idx) => (
            <div
              key={report.id}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-xs font-bold text-slate-300 tabular-nums">
                    {total - ((page - 1) * 10 + idx)}
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    Pending
                  </span>
                  <span className="text-xs text-slate-500 font-mono">#{report.id.slice(0, 8)}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[18px] text-slate-500">category</span>
                <span className="text-sm font-medium text-white">
                  {categoryLabels[report.category] ?? report.category}
                </span>
              </div>

              {/* Chronology */}
              <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                  {report.chronology}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  Kejadian: {new Date(report.incidentDate).toLocaleDateString('id-ID')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setViewReport(report)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-sm font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Detail
                </button>
                {report.evidenceFiles && report.evidenceFiles.length > 0 && (
                  <button
                    onClick={() => handleDownloadEvidence(report)}
                    disabled={downloadingId === report.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                    title="Unduh seluruh bukti terlampir"
                  >
                    {downloadingId === report.id ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        Mengunduh...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Unduh Bukti
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => { setVerifyReport(report); setVerifyEvidence([]) }}
                  disabled={actionLoading === report.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Verifikasi
                </button>
                <button
                  onClick={() => setRejectId(report.id)}
                  disabled={actionLoading === report.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Tolak
                </button>
              </div>
            </div>
          ))}

          <Pagination page={page} limit={10} count={reports.length} onPageChange={setPage} />
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2332] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Alasan Penolakan</h3>
            <p className="text-sm text-slate-400 mb-4">Wajib memberikan alasan mengapa laporan ini ditolak.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tulis alasan penolakan..."
              className="w-full h-32 p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-primary/50"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectId(null); setRejectReason('') }}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-sm font-semibold disabled:opacity-30 transition-all"
              >
                Tolak Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#1a2332] border border-white/10 p-6 sm:p-8 shadow-2xl my-8">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">gavel</span>
              Verifikasi Laporan
            </h3>
            <p className="text-sm text-slate-400 mb-6 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              Anda wajib mengunduh bukti asli, <strong>menyensor data pribadi PII pelapor</strong> secara offline, lalu mengunggahnya kembali di bawah ini sebelum memverifikasi laporan. Jika tidak diubah, Anda bisa langsung verifikasi, namun data asli akan langsung tampil ke publik.
            </p>
            
            <FileUploader 
              files={verifyEvidence} 
              onChange={setVerifyEvidence} 
              maxFiles={5}
            />

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
              <button
                onClick={() => { setVerifyReport(null); setVerifyEvidence([]) }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify(verifyReport.id, verifyEvidence)}
                disabled={actionLoading === verifyReport.id}
                className="px-6 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 text-sm font-bold disabled:opacity-30 transition-all flex items-center gap-2"
              >
                {actionLoading === verifyReport.id ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
                Konfirmasi Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal open={!!viewReport} onClose={() => setViewReport(null)} title="Detail Laporan">
        {viewReport && (
          <>
            <DetailRow label="ID Laporan" value={viewReport.id} mono />
            <DetailRow label="ID Pelaku" value={viewReport.perpetratorId} mono />
            <DetailRow label="ID Pelapor" value={viewReport.reporterId} mono />
            <DetailRow label="Kategori" value={categoryLabels[viewReport.category] ?? viewReport.category} />
            <DetailRow label="Status" value={viewReport.status} />
            <DetailRow label="Tanggal Kejadian" value={new Date(viewReport.incidentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <DetailRow label="Tanggal Lapor" value={new Date(viewReport.createdAt).toLocaleString('id-ID')} />
            {viewReport.lossAmount !== undefined && viewReport.lossAmount !== null && (
              <DetailRow label="Estimasi Kerugian" value={`Rp ${viewReport.lossAmount.toLocaleString('id-ID')}`} />
            )}
            
            {/* Terlapor Details */}
            {viewReport.perpetrator && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Data Terlapor</span>
                {viewReport.perpetrator.bankName && (
                  <DetailRow label="Bank / E-Wallet" value={viewReport.perpetrator.bankName} />
                )}
                {viewReport.perpetrator.accountNumber && (
                  <DetailRow label="Nomor Rekening" value={viewReport.perpetrator.accountNumber} mono />
                )}
                {viewReport.perpetrator.phoneNumber && (
                  <DetailRow label="Nomor Telepon" value={viewReport.perpetrator.phoneNumber} mono />
                )}
                {viewReport.perpetrator.entityName && (
                  <DetailRow label="Nama Entitas" value={viewReport.perpetrator.entityName} />
                )}
                {viewReport.perpetrator.socialMedia && (
                  <div className="flex justify-between items-start py-2 group">
                    <span className="text-sm font-medium text-slate-400 w-1/3">Sosial Media</span>
                    <div className="w-2/3 flex flex-wrap gap-2">
                      {viewReport.perpetrator.socialMedia.split(',').map((sm, i) => (
                        <a key={i} href={sm.trim()} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded">
                          {sm.trim().replace(/^https?:\/\//, '')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-white/5 mt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kronologi</span>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 overflow-y-auto max-h-48">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewReport.chronology}</p>
              </div>
            </div>

            {/* Evidence Links & Files */}
            {(viewReport.evidenceLink || (viewReport.evidenceFiles && viewReport.evidenceFiles.length > 0)) && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Bukti Lampiran</span>
                
                {viewReport.evidenceLink && (
                  <div className="mb-3">
                    <span className="text-sm text-slate-400 block mb-1">Tautan Bukti Tambahan:</span>
                    <a href={viewReport.evidenceLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">
                      {viewReport.evidenceLink}
                    </a>
                  </div>
                )}

                {viewReport.evidenceFiles && viewReport.evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-slate-400 block">File Bukti:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewReport.evidenceFiles.map(file => {
                        const isAbsolute = file.fileUrl.startsWith('http://') || file.fileUrl.startsWith('https://')
                        const isLocalUpload = file.fileUrl.startsWith('/uploads/')
                        const targetPath = file.fileUrl.startsWith('/') ? file.fileUrl : (isLocalUpload ? file.fileUrl : `/uploads/evidence/${file.fileUrl}`)
                        const targetUrl = isAbsolute ? file.fileUrl : `${window.location.protocol}//${window.location.host}${targetPath}`
                        
                        return (
                          <a 
                            key={file.id} 
                            href={targetUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-slate-400">
                              {file.mimeType.startsWith('image/') ? 'image' 
                               : file.mimeType.includes('pdf') ? 'picture_as_pdf' 
                               : 'insert_drive_file'}
                            </span>
                            <span className="text-xs font-medium text-slate-200 truncate">{file.fileName}</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DetailModal>
    </div>
  )
}
