import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { reportsApi } from '../lib/api'
import ReportNavbar from '../components/report/ReportNavbar'
import ProgressSidebar from '../components/report/ProgressSidebar'
import StepOneForm from '../components/report/StepOneForm'
import StepTwoForm from '../components/report/StepTwoForm'
import StepThreeForm from '../components/report/StepThreeForm'
import TurnstileModal from '../components/report/TurnstileModal'
import ReportFooter from '../components/report/ReportFooter'
import SEO from '../components/SEO'

// Draft storage key
const DRAFT_KEY = 'cekreput_report_draft'

export interface ReportFormData {
  accountType: 'bank' | 'ewallet' | 'phone'
  bankName: string
  accountNumber: string
  phoneNumber: string
  entityName: string
  category: string
  incidentDate: string
  chronology: string
  agreedTerms: boolean
  customCategory?: string
  socialMedia: string[]
  evidenceFiles: { url: string; name: string; mimeType: string; sizeBytes: number }[]
  evidenceLink?: string
  lossAmount?: number | ''
  accountId?: string
  gameType?: string
  turnstileToken?: string
}

const INITIAL_FORM: ReportFormData = {
  accountType: 'bank',
  bankName: '',
  accountNumber: '',
  phoneNumber: '',
  entityName: '',
  category: '',
  incidentDate: '',
  chronology: '',
  agreedTerms: false,
  customCategory: '',
  socialMedia: [],
  lossAmount: '',
  evidenceFiles: [],
  evidenceLink: '',
  accountId: '',
  gameType: '',
  turnstileToken: '',
}

export default function ReportScam() {
  const { token, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const [currentStep, setCurrentStep] = useState(1)
  const [highestStep, setHighestStep] = useState(1)
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showTurnstileModal, setShowTurnstileModal] = useState(false)

  // ─── Restore Draft on Mount ────────────────────────────────────

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        const savedTime = new Date(draft.savedAt)
        const now = new Date()
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60)

        // Only restore if saved within last 24 hours
        if (hoursDiff < 24) {
          // Save current scroll position to restore after draft is loaded
          const scrollPosition = window.scrollY
          setForm((prev) => ({
            ...prev,
            ...draft,
            // Don't restore agreedTerms - user must re-agree
            agreedTerms: false,
          }))
          // Restore scroll position after form is updated (prevent auto-scroll to bottom)
          setTimeout(() => {
            window.scrollTo({ top: scrollPosition, behavior: 'auto' })
          }, 0)
          console.log('[ReportScam] Draft restored successfully')
        } else {
          // Draft too old, clear it
          localStorage.removeItem(DRAFT_KEY)
          console.log('[ReportScam] Draft too old, cleared')
        }
      } catch (err) {
        console.error('[ReportScam] Failed to restore draft:', err)
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [])

  // ─── Clear Draft on Success ────────────────────────────────────

  useEffect(() => {
    if (submitSuccess) {
      localStorage.removeItem(DRAFT_KEY)
      console.log('[ReportScam] Draft cleared after successful submit')
    }
  }, [submitSuccess])

  // ─── Save Draft ────────────────────────────────────────────────

  useEffect(() => {
    // Hanya simpan jika ada data yang diisi (agar tidak menimpa dengan form kosong saat load awal) dan belum mensubmit sukses
    const hasData = form.accountNumber || form.phoneNumber || form.entityName || form.chronology || form.category
    
    if (hasData && !submitSuccess) {
      const draftToSave = {
        ...form,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave))
    }
  }, [form, submitSuccess])

  const updateForm = (updates: Partial<ReportFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => {
      const nextStep = Math.min(prev + 1, 3)
      setHighestStep((h) => Math.max(h, nextStep))
      return nextStep
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreSubmit = () => {
    // Only pre-validate, don't submit to API yet
    if (!token) return
    setSubmitError('')
    
    // Validasi singkat data
    if (!form.agreedTerms) {
      setSubmitError('Anda harus menyetujui syarat & ketentuan.')
      return
    }
    
    // Tampilkan modal turnstile
    setShowTurnstileModal(true)
  }

  const submitReportApi = async (turnstileToken: string) => {
    if (!token) return
    setIsSubmitting(true)
    setShowTurnstileModal(false)

    let finalChronology = form.chronology
    if (form.category === 'other' && form.customCategory) {
      finalChronology = `[Kategori Lainnya: ${form.customCategory}]\n\n${form.chronology}`
    } else if (form.category === 'hackback') {
      finalChronology = `[Target Hak milik: Akun ${form.gameType} (${form.accountId})]\n\n${form.chronology}`
    }

    const payload: Record<string, unknown> = {
      accountType: form.accountType,
      category: form.category,
      chronology: finalChronology,
      incidentDate: form.incidentDate,
      lossAmount: form.lossAmount === '' ? undefined : form.lossAmount,
      socialMedia: form.socialMedia.filter(s => s.trim().length > 0),
      evidenceFiles: form.evidenceFiles,
      evidenceLink: form.evidenceLink,
      turnstileToken: turnstileToken,
    }

    if (form.accountType === 'bank') {
      payload.accountNumber = form.accountNumber
      payload.bankName = form.bankName
    } else if (form.accountType === 'ewallet') {
      payload.phoneNumber = form.phoneNumber
      payload.bankName = form.bankName
    } else {
      payload.phoneNumber = form.phoneNumber
    }

    if (form.entityName) payload.entityName = form.entityName

    const { error } = await reportsApi.create(payload as Parameters<typeof reportsApi.create>[0], token)
    setIsSubmitting(false)

    if (error) {
      setSubmitError(error)
      // Gulung ke atas untuk melihat error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setSubmitSuccess(true)
    }
  }

  if (submitSuccess) {
    return (
      <>
        <SEO
          title="Laporan Berhasil Dikirim"
          description="Laporan penipuan Anda telah berhasil dikirim ke CekReput. Tim moderator akan meninjau laporan ini."
          canonical="https://cekreput.com/report"
          noIndex={true}
        />
        <div className="bg-navy-dark text-slate-100 min-h-screen flex flex-col font-display">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb bg-primary w-96 h-96 top-[-10%] left-[-10%] opacity-20"></div>
          <div className="orb bg-blue-600 w-[500px] h-[500px] bottom-[-10%] right-[-5%] opacity-10"></div>
        </div>
        <ReportNavbar />
        <main className="relative z-10 flex-grow flex items-center justify-center px-4">
          <div className="glass-panel rounded-2xl p-8 md:p-12 max-w-lg text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Laporan Berhasil Dikirim!</h2>
            <p className="text-slate-400">
              Terima kasih atas laporan Anda. Tim moderator kami akan meninjau laporan ini dalam 1-3 hari kerja. Anda akan mendapat notifikasi saat laporan diverifikasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => { setSubmitSuccess(false); setForm(INITIAL_FORM); setCurrentStep(1) }}
                className="px-6 py-3 rounded-xl border border-slate-600 text-white font-medium hover:bg-slate-700/50 transition-all"
              >
                Buat Laporan Lain
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-primary text-navy-dark font-bold hover:bg-primary/90 transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </main>
        <ReportFooter />
      </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Laporkan Penipuan"
        description="Laporkan aktivitas penipuan ke CekReput. Bantu lindungi komunitas dengan mendokumentasikan aktivitas kecurangan secara aman dan anonim."
        keywords="lapor penipuan, lapor scam, laporan penipuan online, cekreput"
        canonical="https://cekreput.com/report"
        noIndex={true}
      />
      <div className="bg-navy-dark text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary/30 selection:text-primary-100 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb bg-primary w-96 h-96 top-[-10%] left-[-10%] opacity-20"></div>
        <div className="orb bg-blue-600 w-[500px] h-[500px] bottom-[-10%] right-[-5%] opacity-10"></div>
      </div>

      <ReportNavbar />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Laporkan Penipuan</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Bantu lindungi komunitas dengan mendokumentasikan aktivitas kecurangan secara aman dan anonim.</p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProgressSidebar 
            currentStep={currentStep} 
            highestStep={highestStep}
            onStepClick={(step) => {
              if (step <= highestStep) setCurrentStep(step)
            }}
          />
          
          {/* Main Form Area */}
          <div className="col-span-1 lg:col-span-9 space-y-6 min-h-[500px]">
            {submitError && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {submitError}
              </div>
            )}

            {currentStep === 1 && (
              <StepOneForm isActive={true} form={form} updateForm={updateForm} onNext={handleNext} />
            )}
            
            {currentStep === 2 && (
              <StepTwoForm isActive={true} form={form} updateForm={updateForm} onNext={handleNext} onBack={handleBack} />
            )}

            {currentStep === 3 && (
              <StepThreeForm isActive={true} form={form} updateForm={updateForm} onBack={handleBack} onSubmit={handlePreSubmit} isSubmitting={isSubmitting} />
            )}

            {/* Visual placeholders for inactive steps */}
            {currentStep < 2 && (
              <div className="glass-panel rounded-xl p-6 opacity-50 cursor-not-allowed select-none transition-opacity">
                <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-500 text-sm">2</span>
                  Kronologi Kejadian
                </h2>
              </div>
            )}
            {currentStep < 3 && (
              <div className="glass-panel rounded-xl p-6 opacity-50 cursor-not-allowed select-none transition-opacity">
                <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-500 text-sm">3</span>
                  Konfirmasi & Kirim
                </h2>
              </div>
            )}
          </div>
        </div>
      </main>

      <ReportFooter />
    </div>

    <TurnstileModal 
      isOpen={showTurnstileModal}
      onClose={() => setShowTurnstileModal(false)}
      onVerify={submitReportApi}
    />
    </>
  )
}
