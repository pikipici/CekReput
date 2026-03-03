import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import UserDropdown from './UserDropdown'

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
    setIsMobileMenuOpen(false)
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
              <span className="text-xl font-bold tracking-tight text-white">CekReput</span>
            </Link>

            {/* Auth Area */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn && user ? (
                <UserDropdown
                  userName={user.name}
                  userEmail={user.email}
                  onLogout={logout}
                />
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold transition-all shadow-[0_0_15px_rgba(5,209,168,0.3)] hover:shadow-[0_0_20px_rgba(5,209,168,0.5)]"
                >
                  Masuk
                </button>
              )}
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="material-symbols-outlined">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-background-dark/95 backdrop-blur-md">
            <nav className="flex flex-col px-4 py-4 space-y-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">home</span>
                Beranda
              </Link>
              <Link to="/results" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">search</span>
                Cek
              </Link>
              <Link to="/report" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">report</span>
                Laporkan
              </Link>
              <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">api</span>
                API
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
                <span className="material-symbols-outlined text-[20px]">info</span>
                Tentang
              </a>
              {!isLoggedIn && (
                <div className="pt-3 border-t border-slate-700/50 space-y-2">
                  <button onClick={() => openAuth('login')} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold transition-all">
                    Masuk
                  </button>
                  <button onClick={() => openAuth('register')} className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-all">
                    Daftar
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  )
}
