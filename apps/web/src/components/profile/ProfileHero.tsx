import type { Perpetrator } from '../../lib/api'

interface ProfileHeroProps {
  perpetrator: Perpetrator | null
}

export default function ProfileHero({ perpetrator }: ProfileHeroProps) {
  if (!perpetrator) {
    return (
      <section className="glass-panel rounded-2xl p-6 lg:p-8 animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl mb-4"></div>
      </section>
    )
  }

  const isBank = perpetrator.accountType === 'bank'
  const isPhone = perpetrator.accountType === 'phone'

  const title = perpetrator.bankName || perpetrator.entityName || 'Unknown Entity'
  
  // Format identifier
  let identifier = perpetrator.accountNumber || perpetrator.phoneNumber || ''
  if (identifier.length > 5) {
    identifier = `${identifier.slice(0, 3)}${'x'.repeat(identifier.length - 6)}${identifier.slice(-3)}`
  }

  const iconName = isBank ? 'account_balance' : isPhone ? 'smartphone' : 'storefront'
  
  const isDanger = perpetrator.threatLevel === 'danger'
  const isWarning = perpetrator.threatLevel === 'warning'
  
  const riskColor = isDanger ? 'bg-danger/20 text-danger border-danger/30' : isWarning ? 'bg-warning/20 text-warning border-warning/30' : 'bg-primary/20 text-primary border-primary/30'
  const riskBadgeBg = isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-primary'
  
  // Estimate loss (dummy calculation for now, just to show a number)
  const estLoss = new Intl.NumberFormat('id-ID').format(perpetrator.verifiedReports * 1500000)

  return (
    <section className="glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden group">
      {/* Decorative Background Element */}
      <div className={`absolute top-0 right-0 w-64 h-64 ${isDanger ? 'bg-danger/10' : isWarning ? 'bg-warning/10' : 'bg-primary/10'} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        {/* Entity Image / Icon */}
        <div className="shrink-0 relative">
          <div className={`h-32 w-32 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl ${isDanger ? 'bg-danger/10' : isWarning ? 'bg-warning/10' : 'bg-[#214a42]'}`}>
            <span className="material-symbols-outlined text-6xl text-slate-300">{iconName}</span>
          </div>
          <div className={`absolute -bottom-3 -right-3 ${riskBadgeBg} text-white text-xs font-bold px-3 py-1 rounded-full border-4 border-background-dark shadow-sm flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[16px]">
              {isDanger ? 'warning' : isWarning ? 'error' : 'check_circle'}
            </span>
            {perpetrator.threatLevel.toUpperCase()}
          </div>
        </div>

        {/* Entity Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${riskColor}`}>
              {perpetrator.accountType}
            </span>
          </div>
          <p className="text-xl text-slate-300 font-mono mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">
              {isPhone ? 'call' : 'tag'}
            </span>
            {identifier} <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-2">MASKED FOR PRIVACY</span>
          </p>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
              <p className="text-slate-400 text-xs uppercase font-semibold">Total Laporan</p>
              <p className="text-2xl font-bold text-white mt-1">{perpetrator.totalReports}</p>
              <p className={`${isDanger ? 'text-danger' : 'text-primary'} text-xs flex items-center gap-1 mt-1`}>
                <span className="material-symbols-outlined text-[14px]">
                  {perpetrator.totalReports > 0 ? 'trending_up' : 'trending_flat'}
                </span> Laporan
              </p>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5 min-w-0">
              <p className="text-slate-400 text-xs uppercase font-semibold truncate" title="Estimasi Kerugian">Estimasi Kerugian</p>
              <div className="flex items-baseline gap-1 mt-1 truncate">
                <span className="text-xs sm:text-sm font-bold text-slate-400">Rp</span>
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight" title={estLoss}>{estLoss}</span>
              </div>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
              <p className="text-slate-400 text-xs uppercase font-semibold">Terakhir Dilaporkan</p>
              <p className="text-lg font-bold text-white mt-1">
                {perpetrator.lastReported ? new Date(perpetrator.lastReported).toLocaleDateString('id-ID') : '-'}
              </p>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
              <p className="text-slate-400 text-xs uppercase font-semibold">Verifikasi Laporan</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${riskBadgeBg}`} style={{ width: `${Math.min(100, Math.max(10, (perpetrator.verifiedReports / (perpetrator.totalReports || 1)) * 100))}%` }}></div>
                </div>
                <span className={`${isDanger ? 'text-danger' : 'text-primary'} font-bold text-sm`}>
                  {perpetrator.verifiedReports}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
          <button className="flex items-center justify-center gap-2 w-full bg-[#214a42] hover:bg-[#2a5c52] text-white px-6 py-2.5 rounded-xl font-medium transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">share</span>
            Bagikan Profil
          </button>
          <button className="flex items-center justify-center gap-2 w-full bg-transparent border border-primary text-primary hover:bg-primary/10 px-6 py-2.5 rounded-xl font-medium transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            Pantau Peringatan
          </button>
        </div>
      </div>
    </section>
  )
}
