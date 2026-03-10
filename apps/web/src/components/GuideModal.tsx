

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative glass-panel w-full max-w-full sm:max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-700/50 flex items-center justify-between bg-surface-darker shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 flex-shrink-0">
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">menu_book</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">Panduan Melapor</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">3 Langkah mudah menyelamatkan orang lain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
          </button>
        </div>

        {/* Content - Step by Step */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <div className="space-y-4 sm:space-y-6">

            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-shrink-0 flex sm:block justify-center sm:justify-start">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px]">badge</span>
                  Kumpulkan Identitas Pelaku
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Siapkan data utama milik penipu. Anda memerlukan setidaknya salah satu dari: <span className="text-slate-200 font-medium">Nomor Rekening, Nomor E-Wallet (GoPay/OVO/Dana), atau Nomor Telepon/WhatsApp</span> pelaku. Nama entitas atau toko juga sangat membantu pencarian.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-shrink-0 flex sm:block justify-center sm:justify-start">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px]">screenshot_monitor</span>
                  Siapkan Bukti Pendukung
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Pastikan Anda memiliki bukti kuat dalam bentuk tangkapan layar (screenshot). Bukti yang valid seperti: <span className="text-slate-200 font-medium">Bukti Transfer Bank, Riwayat Chat (WhatsApp/DM), atau Tautan Profil Sosial Media pelaku</span>. Anda dapat mengunggah hingga 3 gambar.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-shrink-0 flex sm:block justify-center sm:justify-start">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px]">verified</span>
                  Moderasi & Publikasi
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Setelah Anda mengisi form laporan, tim CekReput akan meninjau kelengkapan laporan Anda dalam waktu maksimal <span className="text-slate-200 font-medium">24 jam</span>. Hal ini untuk memastikan tidak ada pencemaran nama baik. Setelah diverifikasi, laporan Anda akan terekspos ke publik!
                </p>
              </div>
            </div>

          </div>

          {/* Info Box */}
          <div className="mt-6 sm:mt-8 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[20px] sm:text-[22px] flex-shrink-0 mt-0.5">info</span>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-amber-500 mb-1">Penting untuk Diketahui</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                  Pastikan semua informasi yang Anda berikan adalah benar dan dapat dipertanggungjawabkan. Laporan palsu atau fitnah dapat dikenakan sanksi sesuai hukum yang berlaku.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-[#0f231f] font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 text-sm"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
