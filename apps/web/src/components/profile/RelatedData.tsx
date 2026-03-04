import type { Perpetrator } from '../../lib/api'

interface RelatedDataProps {
  perpetrator: Perpetrator;
}

export default function RelatedData({ perpetrator }: RelatedDataProps) {
  const isBank = perpetrator.accountType === 'bank'
  const isPhone = perpetrator.accountType === 'phone'
  const iconName = isBank ? 'account_balance' : isPhone ? 'smartphone' : 'storefront'
  
  let identifier = perpetrator.accountNumber || perpetrator.phoneNumber || ''
  if (identifier.length > 5) {
    identifier = `${identifier.slice(0, 3)}${'x'.repeat(identifier.length - 6)}${identifier.slice(-3)}`
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide mb-4 pb-2 border-b border-white/10">
        <span className="material-symbols-outlined text-primary text-[18px]">link</span>
        Data Terkait
      </h4>
      
      <div className="flex items-center gap-4 bg-background-dark/50 p-4 rounded-xl border border-white/5">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-2xl">{iconName}</span>
        </div>
        <div>
          <p className="text-sm font-mono font-bold text-white mb-0.5">{identifier}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400 capitalize">
            <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">{perpetrator.accountType}</span>
            {perpetrator.bankName && <span>{perpetrator.bankName}</span>}
          </div>
        </div>
      </div>
    </section>
  )
}
