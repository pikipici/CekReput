import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import GuideModal from './GuideModal'

export default function CTA() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

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
        <div className="rounded-3xl p-8 md:p-12 border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl shadow-none">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <span className="material-symbols-outlined text-[32px]">shield_person</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowGuide(true)}
              className="w-full sm:w-auto px-8 h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all border border-slate-600/50 hover:border-slate-500"
            >
              {t('cta.learnButton')}
            </button>
            <button
              onClick={handleReport}
              className="w-full sm:w-auto px-8 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">warning</span>
              {t('cta.reportButton')}
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">security</span>
            {t('cta.securityNote')}
          </p>
        </div>
      </div>

      {/* Auth Modal — shown when user is not logged in */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialTab="register"
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </section>
  )
}
