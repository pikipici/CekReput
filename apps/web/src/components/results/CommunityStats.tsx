export default function CommunityStats() {
  return (
    <div className="rounded-xl bg-surface-darker border border-[#214a42] p-5">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Community Impact Today</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">security</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">14,203</p>
            <p className="text-xs text-slate-400">Scams Prevented</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <span className="material-symbols-outlined">group_add</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">520</p>
            <p className="text-xs text-slate-400">New Reports</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-300 leading-snug">
        <span className="font-bold text-primary">Tip:</span> Always verify numbers before making transfers. 90% of scams happen via instant transfer apps.
      </div>
    </div>
  )
}
