import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'

interface PerpetratorRow {
  id: string
  accountNumber: string | null
  phoneNumber: string | null
  entityName: string | null
  socialMedia: string | null
  bankName: string | null
  accountType: string
  threatLevel: string
  totalReports: number
  verifiedReports: number
  firstReported: string | null
  lastReported: string | null
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const threatBadge: Record<string, { label: string; className: string }> = {
  danger: { label: 'Bahaya', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  warning: { label: 'Waspada', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  safe: { label: 'Aman', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
}

export default function PerpetratorsPage() {
  const { token } = useAuth()
  const [perpList, setPerpList] = useState<PerpetratorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 10
  const [viewPerp, setViewPerp] = useState<PerpetratorRow | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('q', search)
    if (filterLevel !== 'all') params.append('level', filterLevel)
    params.append('page', String(page))
    params.append('limit', String(LIMIT))
    const qs = params.toString() ? `?${params.toString()}` : ''
    fetch(`${API_BASE}/api/moderation/perpetrators${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.perpetrators) setPerpList(data.perpetrators)
        if (data.total != null) setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, filterLevel, page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Pelaku</h1>
        <p className="text-sm text-slate-400 mt-1">Daftar semua pelaku yang pernah dilaporkan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Cari nomor rekening, HP, atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
        >
          <option value="all">Semua Level</option>
          <option value="danger">🔴 Bahaya</option>
          <option value="warning">🟡 Waspada</option>
          <option value="safe">🟢 Aman</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">No.</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Level</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Identitas</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipe</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bank</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sosial Media</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Laporan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Terverifikasi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : perpList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-500">Tidak ada data pelaku ditemukan</td>
                </tr>
              ) : (
                perpList.map((p, idx) => {
                  const badge = threatBadge[p.threatLevel] ?? threatBadge.safe
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-slate-400 tabular-nums text-center">{total - ((page - 1) * LIMIT + idx)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded-lg border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">
                        {p.accountNumber ?? p.phoneNumber ?? p.entityName ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 capitalize">{p.accountType}</td>
                      <td className="px-6 py-4 text-slate-400">{p.bankName ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs max-w-[200px] truncate" title={p.socialMedia ?? ''}>{p.socialMedia ?? '—'}</td>
                      <td className="px-6 py-4 text-white tabular-nums">{p.totalReports}</td>
                      <td className="px-6 py-4 text-emerald-400 tabular-nums">{p.verifiedReports}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewPerp(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-xs font-medium transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Detail
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} limit={LIMIT} count={perpList.length} onPageChange={setPage} />

      {/* Detail Modal */}
      <DetailModal open={!!viewPerp} onClose={() => setViewPerp(null)} title="Detail Pelaku">
        {viewPerp && (
          <>
            <DetailRow label="ID" value={viewPerp.id} mono />
            <DetailRow label="Nama / Entitas" value={viewPerp.entityName} />
            <DetailRow label="No. Rekening" value={viewPerp.accountNumber} mono />
            <DetailRow label="No. HP" value={viewPerp.phoneNumber} mono />
            <DetailRow label="Sosial Media" value={viewPerp.socialMedia} />
            <DetailRow label="Bank / Wallet" value={viewPerp.bankName} />
            <DetailRow label="Tipe Akun" value={viewPerp.accountType} />
            <DetailRow label="Level Ancaman" value={viewPerp.threatLevel} />
            <DetailRow label="Total Laporan" value={String(viewPerp.totalReports)} />
            <DetailRow label="Terverifikasi" value={String(viewPerp.verifiedReports)} />
            <DetailRow label="Pertama Dilaporkan" value={viewPerp.firstReported ? new Date(viewPerp.firstReported).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
            <DetailRow label="Terakhir Dilaporkan" value={viewPerp.lastReported ? new Date(viewPerp.lastReported).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
            <DetailRow label="Terdaftar" value={new Date(viewPerp.createdAt).toLocaleString('id-ID')} />
          </>
        )}
      </DetailModal>
    </div>
  )
}
