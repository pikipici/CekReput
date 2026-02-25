import type { ReportFormData } from '../../pages/ReportScam'

interface StepThreeFormProps {
  isActive: boolean
  form: ReportFormData
  updateForm: (updates: Partial<ReportFormData>) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  marketplace: 'Penipuan Marketplace',
  investasi: 'Investasi Bodong',
  pinjol: 'Pinjaman Online Ilegal',
  phishing: 'Phishing',
  cod: 'COD Fiktif',
  lowker: 'Lowongan Palsu',
  romance: 'Romance Scam',
  other: 'Lainnya',
}

export default function StepThreeForm({ isActive, form, updateForm, onBack, onSubmit, isSubmitting }: StepThreeFormProps) {
  if (!isActive) {
    return (
      <div className="glass-panel rounded-xl p-6 opacity-50 cursor-not-allowed select-none transition-opacity">
        <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-500 text-sm">3</span>
          Konfirmasi & Kirim
        </h2>
      </div>
    )
  }

  const identityLabel =
    form.accountType === 'bank'
      ? `${form.bankName} — ${form.accountNumber}`
      : form.accountType === 'ewallet'
        ? `${form.bankName} — ${form.phoneNumber}`
        : form.phoneNumber

  return (
    <div className="glass-panel rounded-xl p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/5 pb-6 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">3</span>
          Konfirmasi & Kirim
        </h2>
        <p className="text-slate-400 text-sm mt-2 ml-10">Periksa kembali data laporan Anda sebelum mengirim.</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_search</span>
            Data Pelaku
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 block text-xs mb-0.5">Jenis Akun</span>
              <span className="text-white font-medium capitalize">{form.accountType === 'ewallet' ? 'E-Wallet' : form.accountType === 'bank' ? 'Rekening Bank' : 'Nomor Telepon'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs mb-0.5">Identitas</span>
              <span className="text-white font-mono font-medium">{identityLabel}</span>
            </div>
            {form.entityName && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-xs mb-0.5">Nama Pemilik</span>
                <span className="text-white font-medium">{form.entityName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Kronologi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 block text-xs mb-0.5">Kategori</span>
              <span className="text-white font-medium">{CATEGORY_LABELS[form.category] ?? form.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs mb-0.5">Tanggal Kejadian</span>
              <span className="text-white font-medium">
                {form.incidentDate ? new Date(form.incidentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-xs mb-0.5">Deskripsi</span>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                {form.chronology}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Submit */}
      <div className="pt-6 border-t border-white/5">
        <label className="flex items-start gap-3 cursor-pointer group mb-8">
          <input
            type="checkbox"
            checked={form.agreedTerms}
            onChange={(e) => updateForm({ agreedTerms: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-offset-navy-dark focus:ring-primary"
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            Saya menyatakan bahwa informasi yang saya berikan adalah benar dan akurat. Saya memahami bahwa mengirim laporan palsu dapat mengakibatkan pembekuan akun.{' '}
            <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a>.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Langkah 2
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!form.agreedTerms || isSubmitting}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-navy-dark font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Mengirim...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Kirim Laporan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
