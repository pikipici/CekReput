import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../AuthModal'
import UserDropdown from '../UserDropdown'

export default function ReportNavbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  return (
    <>
      <header className="relative z-50 flex items-center justify-between border-b border-white/5 bg-navy-dark/80 backdrop-blur-md px-6 lg:px-10 py-4 sticky top-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-white cursor-pointer">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-navy-dark">
              <span className="material-symbols-outlined font-bold text-xl">shield</span>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">CekReput</h2>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 ml-4">
            <Link to="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Home</Link>
            <Link to="/report" className="text-white text-sm font-medium transition-colors">Laporkan Penipuan</Link>
            <Link to="/results" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Cek Reputasi</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center relative">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              className="bg-slate-800/50 border border-slate-700 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-500" 
              placeholder="Cari database..."
            />
          </div>
          {isLoggedIn && user ? (
            <UserDropdown
              userName={user.name}
              onLogout={logout}
            />
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-700"
            >
              Masuk
            </button>
          )}
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
