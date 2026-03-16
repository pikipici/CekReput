import { useEffect, useRef, useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

interface TurnstileModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (token: string) => void
}

export default function TurnstileModal({ isOpen, onClose, onVerify }: TurnstileModalProps) {
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [mounted, setMounted] = useState(false)
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)

  // Use dummy key if in local dev environment
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const siteKey = isLocal
    ? '1x00000000000000000000AA' // Cloudflare testing dummy key (always passes)
    : import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

  useEffect(() => {
    setMounted(true)

    // Automatically reset Turnstile when the modal is opened
    if (isOpen && turnstileRef.current) {
      turnstileRef.current.reset()
      setTurnstileLoaded(false)
    }

    // Lock body scroll
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-dark/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative glass-panel rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800/40">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">security</span>
            Verifikasi Keamanan
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 flex flex-col items-center justify-center space-y-4">
          <p className="text-sm text-slate-300 text-center mb-2">
            Sistem kami perlu memastikan Anda adalah manusia sebelum mengirim laporan.
          </p>

          <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 flex justify-center w-full min-h-[85px] items-center">
            {siteKey ? (
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onLoad={() => {
                  console.log('[TurnstileModal] Turnstile widget loaded')
                  setTurnstileLoaded(true)
                }}
                onSuccess={(token) => {
                  console.log('[TurnstileModal] Turnstile verification successful')
                  // Add slight delay for pleasant UX before suddenly closing
                  setTimeout(() => onVerify(token), 600)
                }}
                onError={(error) => {
                  console.error('[TurnstileModal] Turnstile verification failed or expired:', error)
                }}
                onExpire={() => {
                  console.log('[TurnstileModal] Turnstile token expired')
                  turnstileRef.current?.reset()
                }}
                options={{
                  theme: 'dark',
                  size: 'normal',
                }}
              />
            ) : (
              <p className="text-danger text-sm">Sitekey tidak dikonfigurasi.</p>
            )}
          </div>

          {!turnstileLoaded && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Loading Turnstile...
            </p>
          )}

          {isLocal && turnstileLoaded && (
             <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
               <span className="material-symbols-outlined text-[14px]">info</span>
               Menggunakan Testing Key (Otomatis sukses)
             </p>
          )}

        </div>
      </div>
    </div>
  )
}
