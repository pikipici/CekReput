

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined">library_books</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Panduan Melapor</h2>
              <p className="text-xs text-slate-400">3 Langkah mudah menyelamatkan orang lain</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content - Step by Step */}
        <div className="p-6 sm:p-8">
          <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pb-4">
            
            {/* Step 1 */}
            <div className="relative pl-8">
              <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">badge</span>
                Kumpulkan Identitas Pelaku
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Siapkan data utama milik penipu. Anda memerlukan setidaknya salah satu dari: <strong className="text-slate-300">Nomor Rekening, Nomor E-Wallet (GoPay/OVO/Dana), atau Nomor Telepon/WhatsApp</strong> pelaku. Nama entitas atau toko juga sangat membantu pencarian.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative pl-8">
              <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">photo_camera</span>
                Siapkan Bukti Pendukung
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pastikan Anda memiliki bukti kuat dalam bentuk tangkapan layar (screenshot). Bukti yang valid seperti: <strong className="text-slate-300">Bukti Transfer Bank, Riwayat Chat (WhatsApp/DM), atau Tautan Profil Sosial Media pelaku</strong>. Anda dapat mengunggah hingga 3 gambar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-8">
              <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">gpp_good</span>
                Moderasi & Publikasi
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Setelah Anda mengisi form laporan, tim CekReput akan meninjau kelengkapan laporan Anda dalam waktu maksimal 24 jam. Hal ini untuk memastikan tidak ada pencemaran nama baik. Setelah diverifikasi, laporan Anda akan terekspos ke publik!
              </p>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-[#0f231f] font-bold rounded-xl hover:bg-primary-dark transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
