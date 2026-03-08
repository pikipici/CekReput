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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-background-dark">
                <span className="material-symbols-outlined text-[20px] font-bold">shield_lock</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">{t('app.name')}</span>
            </Link>

            {/* Auth Area */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                  className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold transition-all shadow-[0_0_15px_rgba(5,209,168,0.3)] hover:shadow-[0_0_20px_rgba(5,209,168,0.5)]"
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
