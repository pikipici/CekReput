import { Link } from 'react-router-dom'

export default function DangerCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1a0f0f] border border-danger/30 shadow-[0_0_40px_-10px_rgba(255,71,87,0.15)] mb-8">
      {/* Red Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-danger"></div>
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger ring-1 ring-danger/20">
              <span className="material-symbols-outlined text-3xl icon-filled">warning</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                High Risk Detected
                <span className="inline-flex items-center rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger ring-1 ring-inset ring-danger/20">DANGER</span>
              </h2>
              <p className="mt-2 text-slate-300 max-w-lg leading-relaxed">
                Multiple community members have flagged this number as fraudulent. Exercise extreme caution. Do not transfer money or share personal information.
              </p>

              {/* Stats Row */}
              <div className="mt-6 flex flex-wrap gap-6">
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Trust Score</span>
                  <span className="text-xl font-bold text-danger">0/100</span>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Verified Reports</span>
                  <span className="text-xl font-bold text-white">7 Reports</span>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Views</span>
                  <span className="text-xl font-bold text-white">1,204</span>
                </div>
              </div>
            </div>
          </div>

          {/* Radial Progress or Score Visual */}
          <div className="hidden md:flex shrink-0 items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900/50">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-danger" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="10, 100" strokeWidth="4"></path>
              </svg>
              <div className="text-center">
                <span className="block text-2xl font-bold text-danger">High</span>
                <span className="block text-[10px] uppercase text-slate-500">Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">Flagged Categories</span>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-dark px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-slate-700/50">
              <span className="material-symbols-outlined text-primary text-[18px]">shopping_bag</span>
              Marketplace Fraud
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-dark px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-slate-700/50">
              <span className="material-symbols-outlined text-orange-400 text-[18px]">local_shipping</span>
              Fake COD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-dark px-3 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-slate-700/50">
              <span className="material-symbols-outlined text-blue-400 text-[18px]">phishing</span>
              Phishing Attempt
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-slate-800 pt-6">
          <button className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl bg-danger px-6 py-3 text-sm font-bold text-white shadow-lg shadow-danger/20 hover:bg-red-600 transition-colors">
            <span className="material-symbols-outlined">report</span>
            Report This Number Also
          </button>
          <Link to="/profile/890" className="flex-1 justify-center inline-flex items-center gap-2 rounded-xl bg-surface-dark px-6 py-3 text-sm font-bold text-white hover:bg-[#214a42] ring-1 ring-inset ring-slate-700 transition-colors">
            <span className="material-symbols-outlined">visibility</span>
            View Full Evidence
          </Link>
        </div>
      </div>
    </div>
  )
}
