import { useState, useEffect, useRef } from 'react'

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onVerify: (code: string) => Promise<{ error?: string }>
  onResend: () => Promise<{ error?: string; message?: string }>
}

export function OtpVerificationModal({ isOpen, onClose, email, onVerify, onResend }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', ''])
      setActiveIndex(0)
      setError('')
      setCountdown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // Auto verify if all fields are filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('')
      if (fullOtp.length === 6) {
        handleVerify(fullOtp)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        setActiveIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return
    
    setIsLoading(true)
    setError('')
    try {
      const result = await onVerify(codeToVerify)
      if (result?.error) {
        setError(result.error)
      } else {
        onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    setError('')
    try {
      const result = await onResend()
      if (result?.error) {
        setError(result.error)
      } else {
        setCountdown(60)
        setError('')
        // Optionally show success message
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '')
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      const nextIndex = Math.min(pastedData.length, 5)
      setActiveIndex(nextIndex)
      inputRefs.current[nextIndex]?.focus()
      
      if (pastedData.length === 6) {
         handleVerify(pastedData)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Verifikasi Email
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-slate-300 mb-2">
              Kami telah mengirimkan kode 6 digit ke:
            </p>
            <p className="font-semibold text-emerald-400">{email}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                // @ts-ignore
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-950 border-2 rounded-xl text-white outline-none transition-all
                  disabled:opacity-50
                  focus:border-emerald-500 focus:bg-emerald-500/5
                  border-slate-800 hover:border-slate-700"
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Verifikasi"}
          </button>

          <div className="text-center text-sm">
            <span className="text-slate-400">Belum menerima kode? </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
