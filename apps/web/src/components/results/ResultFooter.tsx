export default function ResultFooter() {
  return (
    <footer className="border-t border-[#214a42] bg-surface-darker py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
        <p>© 2024 CekReput. The crowdsourced anti-scam database.</p>
        <div className="flex gap-6">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-white transition-colors" href="#">API</a>
        </div>
      </div>
    </footer>
  )
}
