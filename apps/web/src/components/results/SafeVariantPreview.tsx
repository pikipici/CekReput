export default function SafeVariantPreview() {
  return (
    <div className="rounded-xl bg-surface-darker border border-safe/20 p-5 opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-slate-400 uppercase">What a Safe Result Looks Like</h4>
        <span className="material-symbols-outlined text-safe">check_circle</span>
      </div>
      
      <div className="rounded-lg bg-[#0f291e] border border-safe/30 p-4">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <span className="material-symbols-outlined text-safe text-xl icon-filled">verified_user</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">0811-XXXX-XXXX</p>
            <p className="text-xs text-safe font-medium mt-0.5">Verified Official Business</p>
            <p className="text-[10px] text-slate-400 mt-2">No reports found. This number belongs to <span className="text-white">Official BCA Bank</span>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
