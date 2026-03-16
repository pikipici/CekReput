import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../AuthModal'
import UserDropdown from '../UserDropdown'

export default function ProfileNavbar() {
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
      <header className="sticky top-0 z-50 glass-panel border-b border-[#214a42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white shrink-0">
              <div className="h-8 w-8 text-primary">
                <span className="material-symbols-outlined !text-[32px]">shield_lock</span>
              </div>
              <h2 className="text-white text-xl font-bold tracking-tight hidden sm:block">CekReput</h2>
            </Link>



            {/* Search & Actions */}
            <div className="flex items-center gap-4 flex-1 justify-end">

              <button onClick={handleReportScam} className="bg-transparent hover:bg-primary/10 text-slate-300 hover:text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 border border-slate-600 hover:border-primary/50">
                <span className="material-symbols-outlined text-[16px]">add_alert</span>
                <span className="hidden sm:inline">Report Scam</span>
              </button>
              {user ? (
                <UserDropdown
                  userName={user.name}
                  userEmail={user.email}
                  userBadges={user.badges}
                  onLogout={logout}
                />
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="h-10 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold border border-[#214a42] transition-colors"
                >
                  Masuk
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
