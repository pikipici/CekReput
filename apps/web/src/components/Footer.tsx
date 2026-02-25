export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© 2024 CekReput. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
