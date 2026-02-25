export default function ReportFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-navy-dark pt-12 pb-8 px-6 text-center md:text-left mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-white mb-4 justify-center md:justify-start">
            <div className="size-6 bg-primary rounded flex items-center justify-center text-navy-dark">
              <span className="material-symbols-outlined font-bold text-sm">shield</span>
            </div>
            <span className="text-lg font-bold">CekReput</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
            Empowering the community to fight fraud. Check reputations, report scams, and stay safe in the digital world.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-primary transition-colors">How it works</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Scam Statistics</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">API Documentation</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
          </ul>
        </div>
      </div>
      
      <div className="text-center border-t border-white/5 pt-8">
        <p className="text-slate-600 text-xs">© 2023 CekReput. All rights reserved.</p>
      </div>
    </footer>
  )
}
