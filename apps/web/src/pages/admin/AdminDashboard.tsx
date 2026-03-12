import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ModerationStats {
  pending: number
  verified: number
  rejected: number
  total: number
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function AdminDashboard() {
  const { token, refreshToken } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<ModerationStats>({ pending: 0, verified: 0, rejected: 0, total: 0 })
  const [trends, setTrends] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/moderation/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        // Handle 401 - Token expired
        if (res.status === 401) {
          const refreshResult = await refreshToken()
          if (!refreshResult.success) {
            setError('Session expired. Silakan login ulang.')
            navigate('/')
            return
          }
          // Retry with new token
          return fetchStats()
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        
        const data = await res.json()
        if (data.stats) setStats(data.stats)
        if (data.trends) setTrends(data.trends)
        setError('')
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Gagal memuat data dashboard.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [token, refreshToken, navigate])

  // Proactive token refresh - check every 30 seconds
  useEffect(() => {
    if (!token) return
    
    const checkExpiry = async () => {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64))
        const expiryTime = payload.exp * 1000 // convert to milliseconds
        const now = Date.now()
        const timeUntilExpiry = expiryTime - now
        const fiveMinutes = 5 * 60 * 1000
        
        // Refresh if less than 5 minutes remaining
        if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
          await refreshToken()
        }
      } catch (err) {
        console.error('Token expiry check failed:', err)
      }
    }
    
    const interval = setInterval(checkExpiry, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [token, refreshToken])

  const statCards = [
    { label: 'Laporan Pending', value: stats.pending, icon: 'pending_actions', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { label: 'Terverifikasi', value: stats.verified, icon: 'verified', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { label: 'Ditolak', value: stats.rejected, icon: 'block', color: 'from-rose-500 to-red-600', textColor: 'text-rose-400', bgColor: 'bg-rose-500/10' },
    { label: 'Total Laporan', value: stats.total, icon: 'summarize', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Ringkasan aktivitas dan statistik CekReput</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 group hover:bg-white/[0.04] transition-all"
          >
            {/* Gradient glow */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 tabular-nums ${card.textColor}`}>
                  {loading ? '—' : card.value.toLocaleString('id-ID')}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <span className={`material-symbols-outlined text-[24px] ${card.textColor}`}>{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart Placeholder + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart area */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tren Laporan</h2>
            <span className="text-xs text-slate-500">30 hari terakhir</span>
          </div>
          <div className="h-48 flex items-end gap-1">
            {/* Simple CSS bar chart */}
            {trends.length > 0 ? (
              (() => {
                const maxCount = Math.max(...trends.map(t => t.count), 1) // Prevent division by zero
                return trends.map((t, i) => {
                  const h = Math.max((t.count / maxCount) * 100, 2) // Minimum 2% height for visibility
                  const dateStr = new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/80 hover:from-primary/50 hover:to-primary transition-all cursor-default relative group"
                      style={{ height: `${h}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap bg-slate-800 text-white text-xs py-1 px-2 rounded border border-slate-700 pointer-events-none">
                        <span className="font-bold flex justify-center text-primary">{t.count}</span>
                        <span className="text-[10px] text-slate-300">{dateStr}</span>
                      </div>
                    </div>
                  )
                })
              })()
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                Memuat data tren...
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
          <div className="space-y-3">
            <Link
              to="/admin/moderation"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
              Review Laporan Pending
              {stats.pending > 0 && (
                <span className="ml-auto font-bold tabular-nums">{stats.pending}</span>
              )}
            </Link>
            <Link
              to="/admin/perpetrators"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
              Kelola Data Pelaku
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Kelola Pengguna
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">language</span>
              Buka Situs Publik
              <span className="material-symbols-outlined text-[14px] ml-auto">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
