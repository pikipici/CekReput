import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-background-dark py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 sm:gap-6">
        <p className="text-slate-400 text-xs sm:text-sm text-center">© 2026 CekReput by VCP. All rights reserved.</p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          <Link to="/privacy-policy" className="text-slate-400 hover:text-primary text-xs sm:text-sm transition-colors whitespace-nowrap">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-slate-400 hover:text-primary text-xs sm:text-sm transition-colors whitespace-nowrap">Terms of Service</Link>
          <a href="#" className="text-slate-400 hover:text-primary text-xs sm:text-sm transition-colors whitespace-nowrap">Contact</a>
        </div>
      </div>
    </footer>
  )
}
