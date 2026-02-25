export default function RelatedAlerts() {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Related Alerts</h4>
      <div className="space-y-3">
        <a className="flex items-center gap-3 group" href="#">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
            <span className="material-symbols-outlined text-red-500">warning</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">BCA 882xxxx11</p>
            <p className="text-xs text-slate-400">High Risk • 12 Reports</p>
          </div>
        </a>
        <a className="flex items-center gap-3 group" href="#">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
            <span className="material-symbols-outlined text-orange-500">report_problem</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Mandiri 900xxxx22</p>
            <p className="text-xs text-slate-400">Medium Risk • 5 Reports</p>
          </div>
        </a>
      </div>
    </section>
  )
}
