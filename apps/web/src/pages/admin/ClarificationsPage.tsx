import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'

interface Clarification {
  id: string
  perpetratorId: string
  userId: string
  content: string
  status: string
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function ClarificationsPage() {
  const { token } = useAuth()
  const [clarifications, setClarifications] = useState<Clarification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 10
  const [viewClarification, setViewClarification] = useState<Clarification | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${API_BASE}/api/clarifications/pending?page=${page}&limit=${LIMIT}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.clarifications) setClarifications(data.clarifications)
        else if (Array.isArray(data)) setClarifications(data)
        if (data.total != null) setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, page])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      await fetch(`${API_BASE}/api/clarifications/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      })
      setClarifications(prev => prev.filter(c => c.id !== id))
    } catch {}
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Klarifikasi</h1>
        <p className="text-sm text-slate-400 mt-1">Review permintaan hak jawab dari pihak terlapor</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
        </div>
      ) : clarifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <span className="material-symbols-outlined text-emerald-400 text-5xl mb-3">task_alt</span>
          <p className="text-lg font-semibold text-white">Tidak ada klarifikasi pending</p>
          <p className="text-sm text-slate-400 mt-1">Semua permintaan klarifikasi sudah direview.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clarifications.map((c, idx) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-xs font-bold text-slate-300 tabular-nums">
                    {total - ((page - 1) * LIMIT + idx)}
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    Klarifikasi
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="mb-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Pelaku ID: <span className="font-mono">{c.perpetratorId.slice(0, 8)}...</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewClarification(c)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-sm font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Detail
                </button>
                <button
                  onClick={() => handleAction(c.id, 'approve')}
                  disabled={actionLoading === c.id}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Setujui
                </button>
                <button
                  onClick={() => handleAction(c.id, 'reject')}
                  disabled={actionLoading === c.id}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Tolak
                </button>
              </div>
            </div>
          ))}

          <Pagination page={page} limit={LIMIT} count={clarifications.length} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal open={!!viewClarification} onClose={() => setViewClarification(null)} title="Detail Klarifikasi">
        {viewClarification && (
          <>
            <DetailRow label="ID" value={viewClarification.id} mono />
            <DetailRow label="ID Pelaku" value={viewClarification.perpetratorId} mono />
            <DetailRow label="ID Pemohon" value={viewClarification.userId} mono />
            <DetailRow label="Status" value={viewClarification.status} />
            <DetailRow label="Tanggal" value={new Date(viewClarification.createdAt).toLocaleString('id-ID')} />
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pernyataan</span>
              <div className="mt-2 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{viewClarification.content}</p>
              </div>
            </div>
          </>
        )}
      </DetailModal>
    </div>
  )
}
