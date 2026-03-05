import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cekreput_disclaimer_accepted'

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) {
      setIsOpen(true)
    }
    setHasChecked(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  // Don't render until we've checked localStorage
  if (!hasChecked || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-3 sm:px-4 pb-3 sm:pb-0 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-8 pb-3 sm:pb-4 text-center shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 sm:mb-4">
            <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">gavel</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Selamat Datang di CekReput</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Sebelum melanjutkan, mohon pahami poin-poin penting berikut:</p>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-2 space-y-2.5 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {[
            {
              icon: 'database',
              title: 'Status Data',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              text: 'Seluruh informasi dalam database ini adalah Laporan Masyarakat (Terduga). Data ini belum tentu merupakan putusan hukum final dari pengadilan.',
            },
            {
              icon: 'verified_user',
              title: 'Verifikasi Mandiri',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              text: 'Informasi di sini bertujuan untuk meningkatkan kewaspadaan. Kami sangat menyarankan Anda tetap melakukan verifikasi mandiri sebelum melakukan transaksi apa pun.',
            },
            {
              icon: 'shield',
              title: 'Tanggung Jawab',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              text: 'Pengelola platform tidak bertanggung jawab atas akurasi mutlak data atau kerugian yang timbul dari penggunaan informasi ini.',
            },
            {
              icon: 'balance',
              title: 'Konsekuensi Hukum',
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
              text: 'Penggunaan data untuk tujuan persekusi atau penyebaran fitnah dapat dijerat dengan UU ITE.',
            },
          ].map((item) => (
            <div key={item.title} className={`flex gap-3 p-3 sm:p-3.5 rounded-xl ${item.bg} border border-white/5`}>
              <div className="shrink-0 mt-0.5">
                <span className={`material-symbols-outlined text-lg sm:text-xl ${item.color}`}>{item.icon}</span>
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-semibold ${item.color} mb-0.5`}>{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-500 text-center mb-3 sm:mb-4 leading-relaxed">
            Dengan mengklik tombol di bawah, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh{' '}
            <a href="#" className="text-primary hover:underline">Syarat &amp; Ketentuan</a> kami.
          </p>
          <button
            onClick={handleAccept}
            className="w-full py-3 sm:py-3.5 rounded-xl bg-primary text-navy-dark font-bold text-xs sm:text-sm tracking-wide hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
          >
            SAYA MENGERTI &amp; SETUJU
          </button>
        </div>
      </div>
    </div>
  )
}
