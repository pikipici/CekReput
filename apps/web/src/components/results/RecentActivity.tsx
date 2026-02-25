export default function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Recent Reports</h3>
        <div className="flex gap-2">
          <button className="p-1 text-slate-400 hover:text-white"><span className="material-symbols-outlined">sort</span></button>
          <button className="p-1 text-slate-400 hover:text-white"><span className="material-symbols-outlined">filter_list</span></button>
        </div>
      </div>

      {/* Report Item 1 */}
      <div className="group rounded-xl bg-surface-darker border border-[#214a42]/50 p-5 transition-all hover:border-[#214a42]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">JD</div>
            <div>
              <p className="text-sm font-medium text-white">John Doe <span className="text-slate-500 font-normal">• Verified User</span></p>
              <p className="text-xs text-slate-500">2 hours ago</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20">Scam</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Tried to sell me a PS5 for half price on Facebook Marketplace. Asked for DP transfer to this OVO number. Blocked me immediately after transfer.
        </p>

        <div className="mt-4 flex gap-2">
          <div className="h-16 w-16 rounded-lg bg-slate-800 overflow-hidden relative group/img cursor-pointer">
            <div className="absolute inset-0 bg-black/40 group-hover/img:bg-transparent transition-all"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white/70 group-hover/img:text-white">
              <span className="material-symbols-outlined text-lg">image</span>
            </div>
            <img className="h-full w-full object-cover opacity-50" data-alt="Screenshot of chat proof" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6jxh12YM9wITCXU3t3RUMXYu1NcIc2ogfZkQUFMcQbimtD_lo-TFEOaHTN1jr3GyNkXgq_QrYEVgdP1ovHsRrNnikVq8_lrpUysQOd5zxcEhJb6We7lyF_jSP8Djh8JRltg0NHGmLzUH_ctWQKIpw3MgTTX6t6Wfl_2Z3UGEfBL9WWpm5ke5_LjeuwqsqxPez-A91EHwQFJLtvIQNHc147GAMOQ3cX_VDPSHS1fzsWdYulw84hdeEmAsbz7r0845ehKeNRti501Q"/>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-slate-800 pt-3">
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">thumb_up</span>
            Helpful (12)
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
            Reply
          </button>
        </div>
      </div>

      {/* Report Item 2 */}
      <div className="group rounded-xl bg-surface-darker border border-[#214a42]/50 p-5 transition-all hover:border-[#214a42]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-900/50 flex items-center justify-center text-xs font-bold text-purple-200">SA</div>
            <div>
              <p className="text-sm font-medium text-white">Sarah A. <span className="text-slate-500 font-normal">• Community Member</span></p>
              <p className="text-xs text-slate-500">Yesterday</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-md bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-400/20">Suspicious</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Sent a fake COD package to my house. I didn't order anything. The courier asked for payment for this number.
        </p>
      </div>
    </div>
  )
}
