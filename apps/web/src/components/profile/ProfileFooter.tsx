export default function ProfileFooter() {
  return (
    <footer className="border-t border-[#214a42] mt-12 bg-[#0d1f1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-primary">shield_lock</span>
          <span className="text-sm font-medium">© 2024 CekReput. Community-driven fraud prevention.</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
          <a className="hover:text-primary" href="#">Privacy Policy</a>
          <a className="hover:text-primary" href="#">Terms of Service</a>
          <a className="hover:text-primary" href="#">Contact Support</a>
        </div>
      </div>
    </footer>
  )
}
