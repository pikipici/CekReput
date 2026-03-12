import type { ReportFormData } from '../../pages/ReportScam'

interface StepOneFormProps {
  isActive: boolean
  form: ReportFormData
  updateForm: (updates: Partial<ReportFormData>) => void
  onNext: () => void
}

const BANKS = [
  { value: 'BCA', label: 'Bank Central Asia (BCA)' },
  { value: 'BRI', label: 'Bank Rakyat Indonesia (BRI)' },
  { value: 'Mandiri', label: 'Bank Mandiri' },
  { value: 'BNI', label: 'Bank Negara Indonesia (BNI)' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga' },
  { value: 'BTN', label: 'Bank Tabungan Negara (BTN)' },
  { value: 'Danamon', label: 'Bank Danamon' },
  { value: 'Permata', label: 'Bank Permata' },
  { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)' },
  { value: 'BTPN', label: 'Bank BTPN / Jenius' },
  { value: 'Lainnya', label: 'Bank Lainnya' },
]

const EWALLETS = [
  { value: 'GoPay', label: 'GoPay' },
  { value: 'OVO', label: 'OVO' },
  { value: 'Dana', label: 'DANA' },
  { value: 'ShopeePay', label: 'ShopeePay' },
  { value: 'LinkAja', label: 'LinkAja' },
  { value: 'Lainnya', label: 'E-Wallet Lainnya' },
]

export default function StepOneForm({ isActive, form, updateForm, onNext }: StepOneFormProps) {
  if (!isActive) {
    return (
      <div className="glass-panel rounded-xl p-6 opacity-50 cursor-not-allowed select-none transition-opacity">
        <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-500 text-sm">1</span>
          Data Pelaku
        </h2>
      </div>
    )
  }

  // To support custom "Lainnya" names, we temporarily store the custom name in the form
  // by repurposing the existing bankName string for custom input when 'Lainnya' is active.
  // Actually, to keep it simple, if they select 'Lainnya', we let them type in a new input
  // and dispatch `updateForm({ customBankName: e.target.value })`. We will add `customBankName?: string`
  // cast to ReportFormData, or just piggyback on `bankName` entirely once submitted.
  // Let's use a local state for the select value, and push either the predefined or custom to parent.
  // The simplest way without changing parent types is adding a local `customBank` string,
  // and checking it for `canProceed`. Wait, `updateForm` accepts Partial<ReportFormData>. We can just cast.

  const isCustomBank = form.bankName === 'Lainnya'

  // Get custom bank name from form data
  const customBankName = (form as ReportFormData & { customBankName?: string }).customBankName || ''

  const canProceed =
    (form.accountType === 'bank' && form.bankName && (isCustomBank ? customBankName.length > 0 : true) && form.accountNumber) ||
    (form.accountType === 'ewallet' && form.bankName && (isCustomBank ? customBankName.length > 0 : true) && form.phoneNumber) ||
    (form.accountType === 'phone' && form.phoneNumber)

  const handleNext = () => {
    // If "Lainnya" is selected, we override the bankName with the custom written one before proceeding
    if (isCustomBank && customBankName) {
      updateForm({ bankName: customBankName })
    }
    onNext()
  }

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/5 pb-4 sm:pb-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">1</span>
          Data Pelaku
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 ml-10">Masukkan informasi rekening, e-wallet, atau nomor telepon pelaku penipuan.</p>
      </div>

      {/* Account Type Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">Jenis Akun Pelaku</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { type: 'bank' as const, icon: 'account_balance', label: 'Rekening Bank' },
            { type: 'ewallet' as const, icon: 'account_balance_wallet', label: 'E-Wallet' },
            { type: 'phone' as const, icon: 'smartphone', label: 'Nomor Telepon' },
          ]).map(({ type, icon, label }) => {
            const isSelected = form.accountType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateForm({ accountType: type, bankName: '', accountNumber: '', phoneNumber: '', customBankName: '' } as Partial<ReportFormData> & { customBankName: string })}
                className={`relative flex items-center gap-3 rounded-xl border px-4 py-4 sm:py-3.5 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                  isSelected ? 'bg-primary/20' : 'bg-slate-700/50'
                }`}>
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                <span className="text-sm font-semibold">{label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-primary text-lg absolute top-2 right-2">check_circle</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Bank/E-Wallet Selector */}
        {(form.accountType === 'bank' || form.accountType === 'ewallet') && (
          <div className="col-span-1 space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {form.accountType === 'bank' ? 'Nama Bank' : 'Nama E-Wallet'}
              </label>
              <div className="relative">
                <select
                  value={form.bankName}
                  onChange={(e) => updateForm({ bankName: e.target.value })}
                  className="glass-input w-full h-14 rounded-lg px-4 py-3 appearance-none cursor-pointer focus:ring-0 text-slate-100"
                >
                  <option value="" disabled>Pilih {form.accountType === 'bank' ? 'Bank' : 'E-Wallet'}</option>
                  {(form.accountType === 'bank' ? BANKS : EWALLETS).map((item) => (
                    <option key={item.value} value={item.value} className="bg-slate-800 text-white">{item.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
              </div>
            </div>

            {/* Custom Input for "Lainnya" */}
            {form.bankName === 'Lainnya' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tuliskan Nama {form.accountType === 'bank' ? 'Bank' : 'E-Wallet'} Lainnya
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => updateForm({ customBankName: e.target.value } as Partial<ReportFormData> & { customBankName: string })}
                    className="glass-input w-full h-14 rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100 border-primary/50"
                    placeholder={`Ketik nama ${form.accountType === 'bank' ? 'bank' : 'e-wallet'}...`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-xl">edit</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account Number (bank) */}
        {form.accountType === 'bank' && (
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Rekening</label>
            <div className="relative">
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => updateForm({ accountNumber: e.target.value })}
                className="glass-input w-full h-14 rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100"
                placeholder="Contoh: 1234567890"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="material-symbols-outlined text-slate-500 text-xl">credit_card</span>
              </div>
            </div>
          </div>
        )}

        {/* Phone Number (ewallet/phone) */}
        {(form.accountType === 'ewallet' || form.accountType === 'phone') && (
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Telepon / E-Wallet</label>
            <div className="relative">
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(e) => updateForm({ phoneNumber: e.target.value })}
                className="glass-input w-full h-14 rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100"
                placeholder="Contoh: 081234567890"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="material-symbols-outlined text-slate-500 text-xl">smartphone</span>
              </div>
            </div>
          </div>
        )}

        {/* Entity Name (optional) */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {form.accountType === 'phone' ? 'Nama Pemilik Nomor' : 'Nama Pemilik Rekening'} <span className="text-slate-500">(opsional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.entityName}
              onChange={(e) => updateForm({ entityName: e.target.value })}
              className="glass-input w-full h-14 rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100"
              placeholder={form.accountType === 'phone' ? 'Kosongkan jika tidak tahu atau tidak ada' : 'Nama yang tertera di rekening'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="material-symbols-outlined text-slate-500 text-xl">badge</span>
            </div>
          </div>
        </div>

        {/* Social Media (optional) */}
        <div className="col-span-1 md:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Akun Sosial Media Pelaku <span className="text-slate-500">(opsional)</span>
          </label>

          {(form.socialMedia || []).map((sm, index) => (
            <div key={index} className="flex gap-2 relative animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={sm}
                  onChange={(e) => {
                    const newSm = [...(form.socialMedia || [])]
                    newSm[index] = e.target.value
                    updateForm({ socialMedia: newSm })
                  }}
                  className="glass-input w-full h-14 rounded-lg pl-4 pr-10 py-3 placeholder:text-slate-500 focus:ring-0 text-slate-100"
                  placeholder="Contoh: instagram.com/penipu atau @penipu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-500 text-xl">link</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSm = form.socialMedia.filter((_, i) => i !== index)
                  updateForm({ socialMedia: newSm })
                }}
                className="w-14 h-14 flex items-center justify-center rounded-lg border border-slate-600/50 text-slate-400 hover:text-danger hover:border-danger/50 hover:bg-danger/10 transition-colors"
                title="Hapus baris ini"
              >
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => updateForm({ socialMedia: [...(form.socialMedia || []), ''] })}
            className="text-sm text-primary hover:text-primary-100 font-medium flex items-center gap-1 transition-colors mt-2 p-2 hover:bg-primary/10 rounded-lg inline-flex"
          >
            <span className="material-symbols-outlined text-lg">add</span> Tambah Akun Sosial Media
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex items-center justify-end gap-4 border-t border-white/5 mt-6">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-2.5 rounded-lg bg-primary text-navy-dark font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Langkah Berikutnya
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
