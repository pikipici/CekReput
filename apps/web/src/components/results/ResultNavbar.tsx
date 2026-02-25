import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../AuthModal'
import UserDropdown from '../UserDropdown'

export default function ResultNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  const handleReportScam = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      navigate('/report')
    } else {
      setShowLoginPrompt(true)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#214a42] bg-surface-darker/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-2xl">shield_lock</span>
              </div>
              <span className="hidden md:block text-xl font-bold tracking-tight text-white">CekReput</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/70 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  className="block w-full rounded-xl border-none bg-[#214a42] py-3 pl-12 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:bg-[#1a3d36] transition-all shadow-inner" 
                  placeholder="Search phone number, bank account, or entity name..." 
                  type="text" 
                  defaultValue="081234567890" 
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <a className="text-sm font-medium text-white hover:text-primary transition-colors" href="#">Dashboard</a>
                <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Community</a>
              </nav>
              <button onClick={handleReportScam} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-surface-darker shadow-lg shadow-primary/20 hover:bg-emerald-400 hover:scale-105 transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">add_alert</span>
                <span className="hidden sm:inline">Report Scam</span>
              </button>
              <button className="relative rounded-xl p-2 text-slate-400 hover:bg-[#214a42] hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger"></span>
              </button>
              {user ? (
                <UserDropdown
                  userName={user.name}
                  userEmail={user.email}
                  onLogout={logout}
                />
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="rounded-xl p-1 hover:bg-[#214a42] transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">person</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center animate-fade-in-up">
            <div className="h-14 w-14 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Login Diperlukan</h3>
            <p className="text-slate-400 text-sm mb-6">
              Jika ingin melaporkan penipuan (Report Scam), kamu harus login terlebih dahulu.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowLoginPrompt(false)
                  openAuth('login')
                }}
                className="flex-1 py-2.5 bg-primary text-[#0f231f] rounded-xl hover:bg-primary-dark transition-colors text-sm font-bold"
              >
                Login Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  )
}
