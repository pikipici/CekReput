import { useEffect, useState } from 'react'
import type { ReportFormData } from '../../pages/ReportScam'
import FileUploader from './FileUploader'
import { useAuth } from '../../context/AuthContext'

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
  hackback: 'HackBack Akun',
  other: 'Lainnya',
}

// Draft storage
const DRAFT_KEY = 'cekreput_report_draft'

export default function StepThreeForm({ isActive, form, updateForm, onBack, onSubmit, isSubmitting }: StepThreeFormProps) {
  const { isTokenExpiring, refreshToken } = useAuth()
  const [showExpiryWarning, setShowExpiryWarning] = useState(false)

  const identityLabel =
    form.accountType === 'bank'
      ? `${form.bankName} — ${form.accountNumber}`
      : form.accountType === 'ewallet'
        ? `${form.bankName} — ${form.phoneNumber}`
        : form.phoneNumber

  // ─── Auto-Save Draft ───────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return

    // Save draft whenever form changes
    const draftData = {
      accountType: form.accountType,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      phoneNumber: form.phoneNumber,
      entityName: form.entityName,
      category: form.category,
      chronology: form.chronology,
      incidentDate: form.incidentDate,
      socialMedia: form.socialMedia,
      evidenceFiles: form.evidenceFiles,
      evidenceLink: form.evidenceLink,
      lossAmount: form.lossAmount,
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
  }, [form, isActive])

  // ─── Session Monitoring & Warning ──────────────────────────────

  useEffect(() => {
    if (!isActive) return

    const checkSession = () => {
      if (isTokenExpiring(5)) {
        setShowExpiryWarning(true)
      } else {
        setShowExpiryWarning(false)
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 30 * 1000) // Check every 30 seconds

    return () => {
      clearInterval(interval)
      setShowExpiryWarning(false)
    }
  }, [isActive, isTokenExpiring])

  // ─── Clear Draft on Success ────────────────────────────────────

  useEffect(() => {
    if (!isSubmitting && form.agreedTerms) {
      // Draft will be cleared after successful submit from parent
    }
  }, [isSubmitting, form.agreedTerms])

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

  return (
    <div className="glass-panel rounded-xl p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/5 pb-6 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">3</span>
          Konfirmasi & Kirim
        </h2>
        <p className="text-slate-400 text-sm mt-2 ml-10">Periksa kembali data laporan Anda sebelum mengirim.</p>
      </div>

      {/* Session Expiry Warning */}
      {showExpiryWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px] flex-shrink-0 mt-0.5">warning</span>
          <div className="flex-1">
            <p className="text-sm text-amber-400 font-medium mb-1">
              Session Anda Akan Segera Berakhir
            </p>
            <p className="text-xs text-slate-400">
              Token autentikasi akan segera kadaluarsa. Sistem akan refresh otomatis saat Anda upload bukti. Atau klik tombol di bawah untuk refresh manual.
            </p>
            <button
              onClick={async () => {
                const result = await refreshToken()
                if (result.success) {
                  setShowExpiryWarning(false)
                }
              }}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-medium underline"
            >
              Refresh Session Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Evidence Upload */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Lampirkan Bukti Penipuan
        </h3>
        <FileUploader
          files={form.evidenceFiles}
          onChange={(files) => updateForm({ evidenceFiles: files })}
          maxFiles={5}
          onBeforeUpload={async () => {
            // Check token expiry before upload
            if (isTokenExpiring(5)) {
              const result = await refreshToken()
              if (!result.success) {
                return { success: false, error: 'Session expired. Silakan login ulang.' }
              }
            }
            return { success: true }
          }}
        />
        
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tautan Bukti Tambahan <span className="text-slate-500">(opsional, misal: Google Drive / DropBox)</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={form.evidenceLink || ''}
              onChange={(e) => updateForm({ evidenceLink: e.target.value })}
              className="glass-input w-full rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100"
              placeholder="https://drive.google.com/..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="material-symbols-outlined text-slate-500 text-xl">link</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Gunakan opsi ini jika ukuran file sangat besar atau jika Anda memiliki kumpulan bukti dalam satu folder. Pastikan tautan dapat diakses publik.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 border-t border-white/5 pt-6 mt-6">
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
