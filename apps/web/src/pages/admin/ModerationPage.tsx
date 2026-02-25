import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'

interface PendingReport {
  id: string
  perpetratorId: string
  reporterId: string
  category: string
  chronology: string
  incidentDate: string
  status: string
  createdAt: string
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
  const [viewReport, setViewReport] = useState<PendingReport | null>(null)

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

  const handleVerify = async (id: string) => {
    setActionLoading(id)
    try {
      await fetch(`${API_BASE}/api/moderation/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'verify' }),
      })
      setReports(r => r.filter(rep => rep.id !== id))
    } catch {}
    setActionLoading(null)
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
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setViewReport(report)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-sm font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Detail
                </button>
                <button
                  onClick={() => handleVerify(report.id)}
                  disabled={actionLoading === report.id}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Verifikasi
                </button>
                <button
                  onClick={() => setRejectId(report.id)}
                  disabled={actionLoading === report.id}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-sm font-semibold transition-all disabled:opacity-50"
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
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kronologi</span>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewReport.chronology}</p>
              </div>
            </div>
          </>
        )}
      </DetailModal>
    </div>
  )
}
