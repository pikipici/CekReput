import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface UserDropdownProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
  userBadges?: string[] | null
  onLogout: () => void
}

import UserBadge from './profile/UserBadge'

export default function UserDropdown({ userName, userEmail, userAvatarUrl, userBadges, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
        className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-1 px-1.5 sm:py-1.5 sm:px-2 hover:bg-slate-700/40 transition-all group"
      >
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-md shadow-primary/20 overflow-hidden flex-shrink-0">
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors max-w-[100px] truncate">
          {userName}
        </span>
        <span className={`material-symbols-outlined text-[16px] sm:text-[18px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 top-full mt-2 w-[260px] sm:w-56 rounded-xl bg-slate-800/95 backdrop-blur-md border border-slate-700/60 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[calc(100vw-16px)] sm:max-w-none">
          {/* User Info Header */}
          <div className="px-3 sm:px-4 py-3 border-b border-slate-700/60 flex flex-col gap-1">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate mb-1">{userEmail ?? ''}</p>
            {userBadges && userBadges.length > 0 && (
               <UserBadge badges={userBadges} />
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/profile')
              }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">person</span>
              Profil Saya
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/my-reports')
              }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">description</span>
              Laporan Saya
            </button>
          </div>

          {/* Divider + Logout */}
          <div className="border-t border-slate-700/60 pt-1.5">
            <button
              onClick={() => {
                setIsOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-danger hover:bg-danger/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">logout</span>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
