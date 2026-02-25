import { useLocation } from 'react-router-dom'

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/moderation': 'Moderasi Laporan',
  '/admin/perpetrators': 'Data Pelaku',
  '/admin/users': 'Pengguna',
  '/admin/clarifications': 'Klarifikasi',
  '/admin/api-keys': 'API Keys',
  '/admin/settings': 'Pengaturan',
}

interface AdminTopBarProps {
  onMenuClick: () => void
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { pathname } = useLocation()
  const pageTitle = breadcrumbMap[pathname] ?? 'Admin'

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-6 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-md">
      {/* Mobile Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Admin</span>
        <span className="material-symbols-outlined text-[16px] text-slate-600">chevron_right</span>
        <span className="text-white font-semibold">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
      </div>
    </header>
  )
}
