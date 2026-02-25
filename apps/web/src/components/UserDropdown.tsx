import { useState, useRef, useEffect } from 'react'

interface UserDropdownProps {
  userName: string
  userEmail?: string
  onLogout: () => void
}

export default function UserDropdown({ userName, userEmail, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl py-1.5 px-2 hover:bg-slate-700/40 transition-all group"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-primary/20">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors max-w-[100px] truncate">
          {userName}
        </span>
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl glass-panel shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail ?? ''}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Profil Saya
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              Laporan Saya
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Pengaturan
            </button>
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-slate-700/50 pt-1.5">
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
