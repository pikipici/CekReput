import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import UserDropdown from './UserDropdown'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const { isLoggedIn, user, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded bg-primary text-background-dark flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] font-bold">shield_lock</span>
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight text-white truncate">{t('app.name')}</span>
            </Link>

            {/* Auth Area */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <LanguageSwitcher />
              {isLoggedIn && user ? (
                <UserDropdown
                  userName={user.name}
                  userEmail={user.email}
                  userAvatarUrl={user.avatarUrl}
                  userBadges={user.badges}
                  onLogout={logout}
                />
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="flex items-center justify-center min-h-[44px] h-11 sm:h-10 px-3 sm:px-4 rounded-lg bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold transition-all shadow-[0_0_15px_rgba(5,209,168,0.3)] hover:shadow-[0_0_20px_rgba(5,209,168,0.5)] flex-shrink-0"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  )
}
