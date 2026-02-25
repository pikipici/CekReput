import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../../components/admin/Pagination'
import DetailModal, { DetailRow } from '../../components/admin/DetailModal'

interface UserRow {
  id: string
  name: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  createdAt: string
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const roleBadge: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  moderator: { label: 'Moderator', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  user: { label: 'User', className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
}

export default function UsersPage() {
  const { token, user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 10
  const [viewUser, setViewUser] = useState<UserRow | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('q', search)
    if (roleFilter !== 'all') params.append('role', roleFilter)
    params.append('page', String(page))
    params.append('limit', String(LIMIT))
    const qs = params.toString() ? `?${params.toString()}` : ''

    fetch(`${API_BASE}/api/moderation/users${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.users) setUsers(data.users)
        if (data.total != null) setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, roleFilter, page])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId)
    try {
      const res = await fetch(`${API_BASE}/api/moderation/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as UserRow['role'] } : u))
      }
    } catch {}
    setChangingRole(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengguna</h1>
        <p className="text-sm text-slate-400 mt-1">Kelola pengguna dan hak akses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-primary/50"
        >
          <option value="all">Semua Role</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">No.</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Terdaftar</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">Tidak ada pengguna ditemukan</td>
                </tr>
              ) : (
                users.map((u, idx) => {
                  const badge = roleBadge[u.role] ?? roleBadge.user
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-slate-400 tabular-nums text-center">{total - ((page - 1) * LIMIT + idx)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/50 to-emerald-600/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded-lg border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className="text-xs text-slate-600">— Anda</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={changingRole === u.id}
                            className="h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-primary/50 disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewUser(u)}
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

      <Pagination page={page} limit={LIMIT} count={users.length} onPageChange={setPage} />

      {/* Detail Modal */}
      <DetailModal open={!!viewUser} onClose={() => setViewUser(null)} title="Detail Pengguna">
        {viewUser && (
          <>
            <DetailRow label="ID" value={viewUser.id} mono />
            <DetailRow label="Nama" value={viewUser.name} />
            <DetailRow label="Email" value={viewUser.email} />
            <DetailRow label="Role" value={viewUser.role} />
            <DetailRow label="Terdaftar" value={new Date(viewUser.createdAt).toLocaleString('id-ID')} />
          </>
        )}
      </DetailModal>
    </div>
  )
}
