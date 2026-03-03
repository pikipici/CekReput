import type { ReportFormData } from '../../pages/ReportScam'

interface StepTwoFormProps {
  isActive: boolean
  form: ReportFormData
  updateForm: (updates: Partial<ReportFormData>) => void
  onNext: () => void
  onBack: () => void
}

const CATEGORIES = [
  { value: 'marketplace', label: 'Penipuan Marketplace / Jual Beli Online' },
  { value: 'investasi', label: 'Investasi Bodong' },
  { value: 'pinjol', label: 'Pinjaman Online Ilegal' },
  { value: 'phishing', label: 'Phishing / Social Engineering' },
  { value: 'cod', label: 'COD Fiktif' },
  { value: 'lowker', label: 'Penipuan Lowongan Kerja' },
  { value: 'romance', label: 'Romance Scam' },
  { value: 'hackback', label: 'HackBack Akun' },
  { value: 'other', label: 'Lainnya' },
]

export default function StepTwoForm({ isActive, form, updateForm, onNext, onBack }: StepTwoFormProps) {
  if (!isActive) {
    return (
      <div className="glass-panel rounded-xl p-6 opacity-50 cursor-not-allowed select-none transition-opacity">
        <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-500 text-sm">2</span>
          Kronologi Kejadian
        </h2>
      </div>
    )
  }

  const canProceed = 
    form.category && 
    (form.category === 'other' ? (form.customCategory && form.customCategory.trim().length > 0) : true) && 
    (form.category === 'hackback' ? (form.accountId && form.accountId.trim().length > 0 && form.gameType && form.gameType.trim().length > 0) : true) && 
    form.incidentDate && 
    form.chronology.length >= 100

  return (
    <div className="glass-panel rounded-xl p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/5 pb-6 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">2</span>
          Kronologi Kejadian
        </h2>
        <p className="text-slate-400 text-sm mt-2 ml-10">Ceritakan apa yang terjadi. Semakin detail, semakin baik untuk proses verifikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Kategori Penipuan</label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => updateForm({ category: e.target.value })}
              className="glass-input w-full rounded-lg px-4 py-3 appearance-none cursor-pointer focus:ring-0 text-slate-100"
            >
              <option value="" disabled>Pilih Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">{cat.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <span className="material-symbols-outlined text-xl">expand_more</span>
            </div>
          </div>
          
          {/* Custom Category Input */}
          {form.category === 'other' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-2">Sebutkan Kategori Penipuan</label>
              <input
                type="text"
                value={form.customCategory || ''}
                onChange={(e) => updateForm({ customCategory: e.target.value })}
                className="glass-input w-full rounded-lg px-4 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100 border-primary/50"
                placeholder="Contoh: Penipuan Travel Umroh"
                autoFocus
              />
            </div>
          )}

          {/* HackBack Category Inputs */}
          {form.category === 'hackback' && (
            <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Jenis Game / Platform</label>
                <input
                  type="text"
                  value={form.gameType || ''}
                  onChange={(e) => updateForm({ gameType: e.target.value })}
                  className="glass-input w-full rounded-lg px-4 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100 border-primary/50"
                  placeholder="Contoh: Mobile Legends"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">ID Akun</label>
                <input
                  type="text"
                  value={form.accountId || ''}
                  onChange={(e) => updateForm({ accountId: e.target.value })}
                  className="glass-input w-full rounded-lg px-4 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100 border-primary/50"
                  placeholder="Contoh: 12345678"
                />
              </div>
            </div>
          )}
        </div>

        {/* Date of Incident */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Tanggal Kejadian</label>
          <input
            type="date"
            value={form.incidentDate}
            onChange={(e) => updateForm({ incidentDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="glass-input w-full rounded-lg px-4 py-3 text-slate-300 focus:ring-0 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Loss Amount */}
        <div className="col-span-1 md:col-span-2 space-y-2">
           <label className="block text-sm font-medium text-slate-300">Estimasi Kerugian <span className="text-slate-500">(opsional)</span></label>
           <p className="text-xs text-slate-400 mb-2">Isi jika Anda mengalami kerugian finansial dari kejadian ini.</p>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
               <span className="text-slate-500 font-medium">Rp</span>
             </div>
             <input
               type="text"
               value={form.lossAmount !== '' ? form.lossAmount?.toLocaleString('id-ID') : ''}
               onChange={(e) => {
                 const rawValue = e.target.value.replace(/\D/g, '')
                 updateForm({ lossAmount: rawValue ? parseInt(rawValue, 10) : '' })
               }}
               className="glass-input w-full rounded-lg pl-12 pr-4 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100 font-mono text-lg"
               placeholder="0"
             />
           </div>
        </div>

        {/* Chronology */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Kronologi Detail</label>
          <textarea
            value={form.chronology}
            onChange={(e) => updateForm({ chronology: e.target.value })}
            className="glass-input w-full rounded-lg px-4 py-3 placeholder:text-slate-500 focus:ring-0 resize-y text-slate-100"
            placeholder="Ceritakan secara detail kronologi kejadian penipuan yang Anda alami..."
            rows={6}
          ></textarea>
          <p className={`text-xs mt-2 text-right ${form.chronology.length < 100 ? 'text-amber-400' : 'text-slate-500'}`}>
            {form.chronology.length}/5000 karakter {form.chronology.length < 100 && `(minimal 100)`}
          </p>
        </div>
      </div>

      <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-white/5 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Kembali
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="group flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-navy-dark font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Langkah Berikutnya
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
