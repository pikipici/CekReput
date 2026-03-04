import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-background-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 text-sm">© 2026 CekReput. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="text-slate-400 hover:text-primary text-sm transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-slate-400 hover:text-primary text-sm transition-colors">Terms of Service</Link>
          <a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
