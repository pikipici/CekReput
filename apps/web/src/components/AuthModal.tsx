import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../lib/api'
import { OtpVerificationModal } from './OtpVerificationModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = getStrength(password)
  const label = strength <= 1 ? 'Lemah' : strength <= 3 ? 'Sedang' : 'Kuat'
  const color = strength <= 1 ? 'bg-danger' : strength <= 3 ? 'bg-amber-400' : 'bg-safe'
  const textColor = strength <= 1 ? 'text-danger' : strength <= 3 ? 'text-amber-400' : 'text-safe'
  const width = `${Math.min((strength / 5) * 100, 100)}%`

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width }}
        />
      </div>
      <p className={`text-xs font-medium ${textColor}`}>Kekuatan: {label}</p>
    </div>
  )
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register, verifyEmail, loginWithGoogle, registerWithGoogle, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'google-registration'>(initialTab)
  const [googleData, setGoogleData] = useState<{ email: string; name: string; googleId: string; avatarUrl?: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  // Reset form state when modal opens - using functional updates to avoid cascading renders
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false)
      return
    }
    
    // Reset all form state
    setActiveTab(initialTab)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setAgreedTerms(false)
    setError('')
    setGoogleData(null)
    // Trigger animation after state updates
    const animationFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    })
    
    return () => cancelAnimationFrame(animationFrame)
  }, [isOpen, initialTab])

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (activeTab === 'google-registration') {
      if (password !== confirmPassword) {
        setError('Kata sandi tidak cocok')
        return
      }
      if (!agreedTerms) {
        setError('Anda harus menyetujui Syarat & Ketentuan')
        return
      }
      if (!googleData) {
        setError('Data Google tidak valid. Silakan muat ulang halaman.')
        return
      }
      const result = await registerWithGoogle(name, email, password, googleData.googleId, googleData.avatarUrl)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    } else if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setError('Kata sandi tidak cocok')
        return
      }
      if (!agreedTerms) {
        setError('Anda harus menyetujui Syarat & Ketentuan')
        return
      }
      const result = await register(name, email, password)
      if (result.requiresOtp && result.email) {
        setOtpEmail(result.email)
        setShowOtpModal(true)
        return
      }
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    } else {
      const result = await login(email, password)
      if (result.requiresOtp && result.email) {
        setOtpEmail(result.email)
        setShowOtpModal(true)
        return
      }
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    }
  }

  const handleVerifyOtp = async (code: string) => {
    const result = await verifyEmail(otpEmail, code)
    if (!result.error) {
      setShowOtpModal(false)
      onClose()
    }
    return result
  }

  const handleResendOtp = async () => {
    const { error, data } = await authApi.resendOtp({ email: otpEmail })
    return { error: error ?? undefined, message: data?.message }
  }

  const initGoogle = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    const g = window.google
    if (g && g.accounts) {
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setError('')
          const result = await loginWithGoogle(response.credential)
          if (result.requiresRegistration && result.googleData) {
            setGoogleData(result.googleData)
            setName(result.googleData.name)
            setEmail(result.googleData.email)
            setActiveTab('google-registration')
            setError('Tampaknya email Anda belum terdaftar. Selesaikan pendaftaran Anda dengan membuat kata sandi.')
          } else if (result.error) {
            setError(result.error)
          } else {
            onClose()
          }
        },
      })
      
      // Render the original google button hidden
      const hiddenBtn = document.getElementById('hidden-google-btn')
      if (hiddenBtn) {
        hiddenBtn.innerHTML = ''
        g.accounts.id.renderButton(hiddenBtn, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          width: 400,
        })
      }
    }
  }, [loginWithGoogle, onClose])

  useEffect(() => {
    if (isOpen) {
      if (window.google) {
        initGoogle()
      } else {
        let attempts = 0
        const checkGoogle = setInterval(() => {
          attempts++
          if (window.google) {
            initGoogle()
            clearInterval(checkGoogle)
          } else if (attempts > 30) { 
            // Give up after 15 seconds
            clearInterval(checkGoogle)
          }
        }, 500)
        return () => clearInterval(checkGoogle)
      }
    }
  }, [isOpen, initGoogle])

  const handleGoogleClick = () => {
    setError('') // Clear previous errors
    
    // Check if Client ID exists
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      setError("Fitur Google Login tidak tersedia: VITE_GOOGLE_CLIENT_ID belum dikonfigurasi di server.")
      return
    }

    const g = window.google
    if (!g || !g.accounts) {
      setError("Skrip Google belum selesai dimuat. Silakan coba lagi sebentar.")
      return
    }

    // Click the hidden Google-rendered button or attempt One Tap if fails
    const hiddenBtn = document.getElementById('hidden-google-btn')
    if (hiddenBtn) {
      const iframe = hiddenBtn.querySelector('iframe')
      if (iframe) {
        const wrapper = hiddenBtn.querySelector('[role="button"]') as HTMLElement
        wrapper?.click()
        return
      } else {
        const btn = hiddenBtn.querySelector('div[role="button"]') as HTMLElement ?? hiddenBtn.querySelector('div')
        if (btn) {
          btn.click()
          return
        }
      }
    }
    
    // Fallback: Use google prompt (One Tap UI)
    g.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setError("Gagal memunculkan popup Google. Silakan izinkan popup di browser Anda atau muat ulang halaman.")
      }
    })
  }

  if (!isOpen) return null

  if (showOtpModal) {
    return (
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false)
          onClose() // Also close main modal if user bails out of OTP
        }}
        email={otpEmail}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    )
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Glow effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-emerald-500/10 to-primary/20 rounded-3xl blur-lg opacity-60" />

        {/* Modal Card */}
        <div className="relative glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all z-10"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/30 mb-4">
              <span className="material-symbols-outlined text-white text-2xl">shield_lock</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'login' && 'Masuk ke CekReput'}
              {activeTab === 'register' && 'Daftar di CekReput'}
              {activeTab === 'google-registration' && 'Lengkapi Pendaftaran'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === 'login' && 'Selamat datang kembali!'}
              {activeTab === 'register' && 'Buat akun untuk mulai melaporkan penipu'}
              {activeTab === 'google-registration' && 'Buat kata sandi untuk mengamankan akun Google Anda'}
            </p>
          </div>

          {/* Tab Switcher */}
          {(activeTab === 'login' || activeTab === 'register') && (
          <div className="flex rounded-xl bg-slate-800/60 p-1 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar
            </button>
          </div>
          )}

          {/* Hidden Google rendered button */}
          <div id="hidden-google-btn" className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true" />

          {/* Custom styled Google button */}
          {(activeTab === 'login' || activeTab === 'register') && (
            <>
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-600 bg-slate-800/40 text-white text-sm font-semibold hover:bg-slate-700/60 hover:border-slate-500 transition-all group disabled:opacity-50 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {activeTab === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">atau</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Register only) */}
            {(activeTab === 'register' || activeTab === 'google-registration') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">person</span>
                  <input
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => activeTab === 'google-registration' ? null : setName(e.target.value)}
                    readOnly={activeTab === 'google-registration'}
                    required
                    className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm ${
                      activeTab === 'google-registration' 
                        ? 'bg-slate-800/50 border border-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'glass-input text-white placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">mail</span>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => activeTab === 'google-registration' ? null : setEmail(e.target.value)}
                  readOnly={activeTab === 'google-registration'}
                  required
                  className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm ${
                    activeTab === 'google-registration' 
                      ? 'bg-slate-800/50 border border-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'glass-input text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={activeTab === 'register' || activeTab === 'google-registration' ? 8 : undefined}
                  className="w-full h-12 pl-10 pr-12 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {(activeTab === 'register' || activeTab === 'google-registration') && <PasswordStrengthBar password={password} />}
            </div>

            {/* Confirm Password (Register only) */}
            {(activeTab === 'register' || activeTab === 'google-registration') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">lock</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-12 pl-10 pr-12 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Kata sandi tidak cocok
                  </p>
                )}
              </div>
            )}

            {/* Forgot Password (Login only) */}
            {activeTab === 'login' && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">
                  Lupa kata sandi?
                </button>
              </div>
            )}

            {/* Terms & Conditions (Register only) */}
            {(activeTab === 'register' || activeTab === 'google-registration') && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Saya setuju dengan{' '}
                  <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a>
                  {' '}serta{' '}
                  <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              )}
              {activeTab === 'login' && 'Masuk'}
              {activeTab === 'register' && 'Daftar Sekarang'}
              {activeTab === 'google-registration' && 'Selesaikan Pendaftaran'}
            </button>
          </form>

          {/* Switch Tab Footer */}
          {activeTab !== 'google-registration' && (
          <p className="text-center text-sm text-slate-400 mt-5">
            {activeTab === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button
                  onClick={() => { setActiveTab('register'); setError('') }}
                  className="text-primary font-semibold hover:underline"
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  onClick={() => { setActiveTab('login'); setError('') }}
                  className="text-primary font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </>
            )}
          </p>
          )}
        </div>
      </div>
    </div>
  )
}
