import { useAuth } from '../../context/AuthContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-sm text-slate-400 mt-1">Pengaturan akun dan preferensi admin</p>
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informasi Akun</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/20">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AD'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.name ?? 'Admin'}</p>
              <p className="text-sm text-slate-400">{user?.email ?? ''}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold uppercase rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20">
                {user?.role ?? 'admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Preferensi</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Notifikasi Email</p>
              <p className="text-xs text-slate-400 mt-0.5">Terima notifikasi saat ada laporan baru</p>
            </div>
            <button className="relative w-11 h-6 rounded-full bg-primary/20 border border-primary/30 transition-colors">
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary shadow-md transform translate-x-5 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Notifikasi Browser</p>
              <p className="text-xs text-slate-400 mt-0.5">Push notification untuk laporan pending</p>
            </div>
            <button className="relative w-11 h-6 rounded-full bg-slate-600 border border-slate-500 transition-colors">
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-slate-400 shadow-md transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
        <h2 className="text-lg font-semibold text-rose-400 mb-2">Zona Berbahaya</h2>
        <p className="text-sm text-slate-400 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
        <button className="px-5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-sm font-semibold transition-all">
          Hapus Akun
        </button>
      </div>
    </div>
  )
}
