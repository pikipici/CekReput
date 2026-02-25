import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  pendingReports?: number
  pendingClarifications?: number
}

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/moderation', icon: 'fact_check', label: 'Moderasi Laporan', badgeKey: 'reports' as const },
  { to: '/admin/perpetrators', icon: 'group', label: 'Data Pelaku' },
  { to: '/admin/users', icon: 'person', label: 'Pengguna' },
  { to: '/admin/clarifications', icon: 'forum', label: 'Klarifikasi', badgeKey: 'clarifications' as const },
  { to: '/admin/settings', icon: 'settings', label: 'Pengaturan' },
]

export default function AdminSidebar({ isOpen, onClose, pendingReports = 0, pendingClarifications = 0 }: AdminSidebarProps) {
  const { user, logout } = useAuth()

  const badges: Record<string, number> = {
    reports: pendingReports,
    clarifications: pendingClarifications,
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col border-r border-white/5 bg-[#111827] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[18px]">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">CekReput</span>
            <span className="ml-1 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">ADMIN</span>
          </div>
          {/* Close button mobile */}
          <button onClick={onClose} className="ml-auto lg:hidden p-1 text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                  )}
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badgeKey && badges[item.badgeKey] > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400 tabular-nums">
                      {badges[item.badgeKey]}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/5 p-4 space-y-3 shrink-0">
          {/* Link to public site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">language</span>
            Ke Situs Publik
            <span className="material-symbols-outlined text-[14px] ml-auto">open_in_new</span>
          </a>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
