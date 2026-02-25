import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function CTA() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  const handleReport = () => {
    if (user) {
      navigate('/report')
    } else {
      setShowAuth(true)
    }
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg dark:shadow-none">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">shield_person</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Pernah Menjadi Korban Penipuan?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Jangan diam saja. Bantu orang lain agar tidak tertipu dengan melaporkan nomor atau rekening penipu di sini. Laporan Anda menyelamatkan yang lain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium transition-colors border border-slate-200 dark:border-slate-600">
              Pelajari Cara Melapor
            </button>
            <button
              onClick={handleReport}
              className="w-full sm:w-auto px-8 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">warning</span>
              Laporkan Penipu
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal — shown when user is not logged in */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialTab="register"
      />
    </section>
  )
}
