interface ProgressSidebarProps {
  currentStep: number;
}

const STEPS = [
  { label: 'Langkah 1', title: 'Data Pelaku' },
  { label: 'Langkah 2', title: 'Kronologi Kejadian' },
  { label: 'Langkah 3', title: 'Konfirmasi & Kirim' },
]

export default function ProgressSidebar({ currentStep }: ProgressSidebarProps) {
  return (
    <>
      {/* Desktop Progress Sidebar */}
      <div className="hidden lg:block lg:col-span-3 sticky top-28 space-y-8">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Progres</h3>
          <div className="relative pl-4 border-l-2 border-slate-700 space-y-8">
            {STEPS.map((step, i) => {
              const stepNum = i + 1
              const isActive = currentStep >= stepNum
              return (
                <div key={stepNum} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${isActive ? 'bg-primary' : 'bg-slate-700'} ring-4 ring-navy-dark`}></div>
                  <p className={`${isActive ? 'text-primary' : 'text-slate-500'} font-bold text-sm mb-1`}>{step.label}</p>
                  <p className={`${isActive ? 'text-white' : 'text-slate-400'} font-medium`}>{step.title}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Secure & Anonymous Badge */}
        <div className="glass-panel rounded-xl p-6 bg-gradient-to-b from-primary/10 to-transparent border-primary/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary mt-1">security</span>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Aman & Anonim</p>
              <p className="text-xs text-slate-400 leading-relaxed">Laporan Anda terenkripsi. Identitas pelapor tidak akan ditampilkan secara publik.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress (Top) */}
      <div className="lg:hidden col-span-1 w-full glass-panel rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center text-sm font-medium mb-2">
          <span className="text-white">Langkah {currentStep} dari 3</span>
          <span className="text-primary">{Math.round((currentStep / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
        </div>
      </div>
    </>
  )
}
