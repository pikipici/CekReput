import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ApiKeyRow {
  id: string
  userId: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
  isActive: boolean
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export default function ApiKeysPage() {
  const { token } = useAuth()
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${API_BASE}/api/moderation/api-keys`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.keys) setKeys(data.keys)
        else if (Array.isArray(data)) setKeys(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-sm text-slate-400 mt-1">Daftar semua API key yang terdaftar oleh pengguna</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Prefix</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Terakhir Digunakan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">Belum ada API key terdaftar</td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{k.prefix}...</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded-lg border ${
                        k.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                      }`}>
                        {k.isActive ? 'Aktif' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('id-ID') : 'Belum pernah'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(k.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
