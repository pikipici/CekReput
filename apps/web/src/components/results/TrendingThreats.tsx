export default function TrendingThreats() {
  return (
    <div className="rounded-xl bg-surface-darker border border-[#214a42] p-5">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Trending Threats</h3>
      
      <ul className="space-y-3">
        <li className="flex items-start gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
          <span className="text-danger font-bold text-sm mt-0.5">#1</span>
          <div>
            <p className="text-sm font-medium text-white hover:text-primary cursor-pointer">Fake Job Recruiters</p>
            <p className="text-xs text-slate-500">2.1k reports this week</p>
          </div>
        </li>
        <li className="flex items-start gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
          <span className="text-danger font-bold text-sm mt-0.5">#2</span>
          <div>
            <p className="text-sm font-medium text-white hover:text-primary cursor-pointer">APK Phishing File</p>
            <p className="text-xs text-slate-500">1.8k reports this week</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-danger font-bold text-sm mt-0.5">#3</span>
          <div>
            <p className="text-sm font-medium text-white hover:text-primary cursor-pointer">Giveaway Scams</p>
            <p className="text-xs text-slate-500">900 reports this week</p>
          </div>
        </li>
      </ul>

      <button className="mt-4 w-full text-center text-xs font-bold text-primary hover:text-emerald-400 transition-colors">
        View All Trends
      </button>
    </div>
  )
}
