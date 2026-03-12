import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'
import { reportsApi, type Report, type EvidenceFile } from '../../lib/api'

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
  const { token, refreshToken } = useAuth()
  const navigate = useNavigate()
  const [perpList, setPerpList] = useState<PerpetratorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 10

  // Report Modals State
  const [reportsModalPerpId, setReportsModalPerpId] = useState<string | null>(null)
  const [reportsModalType, setReportsModalType] = useState<'all' | 'verified'>('verified')
  const [modalReportsList, setModalReportsList] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [viewReport, setViewReport] = useState<Report | null>(null)
  const [loadingReportDetail, setLoadingReportDetail] = useState(false)
  const [error, setError] = useState('')

  // Helper: Handle 401 errors
  const handle401 = async () => {
    const refreshResult = await refreshToken()
    if (!refreshResult.success) {
      setError('Session expired. Silakan login ulang.')
      navigate('/')
      return false
    }
    return true
  }

  useEffect(() => {
    if (reportsModalPerpId && token) {
      setLoadingReports(true)
      setError('')
      const queryParams = reportsModalType === 'verified' ? '?status=verified' : ''
      fetch(`${API_BASE}/api/moderation/perpetrators/${reportsModalPerpId}/reports${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async res => {
          if (res.status === 401) {
            if (await handle401()) {
              return // Will retry on next render
            }
            return
          }
          return res.json()
        })
        .then(data => {
          if (data) setModalReportsList(data.reports ?? [])
        })
        .catch(err => {
          console.error('Failed to fetch reports:', err)
          setError('Gagal memuat laporan.')
        })
        .finally(() => setLoadingReports(false))
    }
  }, [reportsModalPerpId, reportsModalType, token])

  const handleViewReportDetail = (reportId: string) => {
    setLoadingReportDetail(true)
    setError('')
    reportsApi.getById(reportId)
      .then(res => {
        if (res.error) {
          setError(res.error)
        } else {
          setViewReport(res.data?.report ?? null)
        }
      })
      .catch(err => {
        console.error('Failed to fetch report detail:', err)
        setError('Gagal memuat detail laporan.')
      })
      .finally(() => setLoadingReportDetail(false))
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (search) params.append('q', search)
    if (filterLevel !== 'all') params.append('level', filterLevel)
    params.append('page', String(page))
    params.append('limit', String(LIMIT))
    const qs = params.toString() ? `?${params.toString()}` : ''
    fetch(`${API_BASE}/api/moderation/perpetrators${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (r.status === 401) {
          if (await handle401()) {
            return // Will retry on next render
          }
          return
        }
        return r.json()
      })
      .then(data => {
        if (data) {
          if (data.perpetrators) setPerpList(data.perpetrators)
          if (data.total != null) setTotal(data.total)
        }
      })
      .catch(err => {
        console.error('Failed to fetch perpetrators:', err)
        setError('Gagal memuat data pelaku.')
      })
      .finally(() => setLoading(false))
  }, [token, search, filterLevel, page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Pelaku</h1>
        <p className="text-sm text-slate-400 mt-1">Daftar semua pelaku yang pernah dilaporkan</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

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
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Laporan</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Terverifikasi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : perpList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">Tidak ada data pelaku ditemukan</td>
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
                      <td className="px-6 py-4 text-center">
                        {p.totalReports > 0 ? (
                          <button
                            onClick={() => { setReportsModalType('all'); setReportsModalPerpId(p.id) }}
                            className="px-3 py-1 bg-white/10 text-slate-300 border border-white/10 rounded-lg hover:bg-white/20 hover:text-white transition-colors font-bold text-sm"
                            title="Lihat Semua Laporan"
                          >
                            {p.totalReports}
                          </button>
                        ) : (
                          <span className="text-slate-500 tabular-nums">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {p.verifiedReports > 0 ? (
                          <button
                            onClick={() => { setReportsModalType('verified'); setReportsModalPerpId(p.id) }}
                            className="px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors font-bold text-sm"
                            title="Lihat Laporan Terverifikasi"
                          >
                            {p.verifiedReports}
                          </button>
                        ) : (
                          <span className="text-slate-500 tabular-nums">0</span>
                        )}
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

      {/* Reports List Modal */}
      <DetailModal open={!!reportsModalPerpId} onClose={() => { setReportsModalPerpId(null); setModalReportsList([]) }} title={reportsModalType === 'all' ? 'Semua Laporan' : 'Laporan Terverifikasi'}>
        {loadingReports ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : modalReportsList.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Tidak ada laporan ditemukan</p>
        ) : (
          <div className="space-y-3 mt-4">
            {modalReportsList.map(report => (
              <div key={report.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => handleViewReportDetail(report.id)}>
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm truncate">
                      {report.reporterName ?? 'Seseorang'} 
                    </p>
                    {reportsModalType === 'all' && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        report.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                        report.status === 'rejected' ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/15 text-amber-400 border-amber-500/20'
                      }`}>
                        {report.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">
                    <span className="text-slate-400 font-normal">
                      {new Date(report.createdAt).toLocaleString('id-ID', { 
                        day: 'numeric', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                      {' - '}
                      {report.lossAmount ? `Rp ${report.lossAmount.toLocaleString('id-ID')}` : 'Rp 0'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 capitalize flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">sell</span>
                    Kategori: {report.category.replace('_', ' ')}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        )}
      </DetailModal>

      {/* Report Detail Modal */}
      <DetailModal open={!!viewReport} onClose={() => setViewReport(null)} title="Detail Laporan">
        {loadingReportDetail ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : viewReport ? (
          <>
            <DetailRow label="ID Laporan" value={viewReport.id} mono />
            <DetailRow label="ID Pelapor" value={viewReport.reporterId} mono />
            <DetailRow label="Kategori" value={viewReport.category} />
            <DetailRow label="Tanggal Kejadian" value={new Date(viewReport.incidentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
            {viewReport.lossAmount !== null && (
              <DetailRow label="Kerugian" value={`Rp ${viewReport.lossAmount.toLocaleString('id-ID')}`} />
            )}
            {(() => {
              let displayChro = viewReport.chronology
              let gameType: string | null = null
              let accountId: string | null = null

              if (viewReport.category === 'hackback') {
                const match = displayChro.match(/^\[Target Hak milik: Akun (.+?) \((.+?)\)\]\s*\n\n([\s\S]*)$/)
                if (match) {
                  gameType = match[1]
                  accountId = match[2]
                  displayChro = match[3]
                }
              }

              return (
                <>
                  {gameType && accountId && (
                    <>
                      <DetailRow label="Jenis Game" value={gameType} />
                      <DetailRow label="ID Akun" value={accountId} mono />
                    </>
                  )}
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kronologi</span>
                    <p className="text-sm text-slate-300 mt-2 p-3 bg-white/5 rounded-xl whitespace-pre-wrap">{displayChro}</p>
                  </div>
                </>
              )
            })()}
            {viewReport.evidence && viewReport.evidence.length > 0 && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">File Bukti</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewReport.evidence.map((file: EvidenceFile) => (
                    <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-slate-800 rounded-lg text-xs text-primary hover:bg-slate-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">attachment</span>
                      {file.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </DetailModal>
    </div>
  )
}
