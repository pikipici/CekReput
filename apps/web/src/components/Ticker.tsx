import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface TickerItem {
  id: string
  category: string
  identity: string
  icon: string
  createdAt: string
}

const categoryLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  marketplace: { label: 'PENIPUAN MARKETPLACE', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  investment: { label: 'INVESTASI BODONG', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  loan: { label: 'PINJAMAN ILEGAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  phishing: { label: 'PHISHING', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  cod: { label: 'COD FIKTIF', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  job: { label: 'LOWONGAN PALSU', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  romance: { label: 'ROMANCE SCAM', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  other: { label: 'PENIPUAN', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/api/reports/recent`)
      .then(r => r.json())
      .then(data => { if (data.reports) setItems(data.reports) })
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  // Show max 5 items, duplicate for seamless scroll loop
  const display = items.slice(0, 5)
  const tickerItems = [...display, ...display]

  return (
    <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-background-dark/50 backdrop-blur-sm py-3 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Live Reports</span>
        </div>
        <div className="ticker-wrap relative flex-1 h-6 items-center overflow-hidden">
          <div className="animate-ticker flex gap-8 items-center absolute whitespace-nowrap">
            {tickerItems.map((item, i) => {
              const cat = categoryLabels[item.category] ?? categoryLabels.other
              return (
                <div key={`${item.id}-${i}`} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">{item.icon}</span>
                  <span className="font-mono text-slate-800 dark:text-white">{item.identity}</span>
                  <span className={`px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} text-[10px] font-bold border ${cat.border}`}>
                    {cat.label}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs">• {timeAgo(item.createdAt)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
