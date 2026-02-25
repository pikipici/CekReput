import { useState, useMemo } from 'react'

const DUMMY_DATA = {
  'Last 12 Months': [
    { label: "Jan '23", value: 2, height: '10%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "Feb '23", value: 3, height: '15%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "Mar '23", value: 1, height: '5%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "Apr '23", value: 2, height: '8%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "May '23", value: 4, height: '20%', color: 'bg-primary/40', hover: 'group-hover:bg-primary/60' },
    { label: "Jun '23", value: 5, height: '25%', color: 'bg-primary/40', hover: 'group-hover:bg-primary/60' },
    { label: "Jul '23", value: 2, height: '10%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "Aug '23", value: 8, height: '40%', color: 'bg-danger/60', hover: 'group-hover:bg-danger/80', note: 'Spiked' },
    { label: "Sep '23", value: 7, height: '35%', color: 'bg-danger/50', hover: 'group-hover:bg-danger/70' },
    { label: "Oct '23", value: 12, height: '60%', color: 'bg-danger/70', hover: 'group-hover:bg-danger/90' },
    { label: "Nov '23", value: 16, height: '80%', color: 'bg-danger', hover: 'group-hover:bg-danger' },
    { label: "Dec '23", value: 11, height: '55%', color: 'bg-danger/70', hover: 'group-hover:bg-danger/90' },
  ],
  'Last 30 Days': Array.from({ length: 15 }, (_, i) => ({
    label: `Day ${i * 2 + 1}`,
    value: Math.floor(Math.random() * 5) + (i > 10 ? 10 : 0),
    height: `${Math.floor(Math.random() * 30) + (i > 10 ? 50 : 10)}%`,
    color: i > 10 ? 'bg-danger/70' : 'bg-primary/30',
    hover: i > 10 ? 'group-hover:bg-danger/90' : 'group-hover:bg-primary/50'
  })),
  'All Time': [
    { label: "2019", value: 4, height: '15%', color: 'bg-primary/30', hover: 'group-hover:bg-primary/50' },
    { label: "2020", value: 12, height: '30%', color: 'bg-primary/40', hover: 'group-hover:bg-primary/60' },
    { label: "2021", value: 25, height: '50%', color: 'bg-danger/60', hover: 'group-hover:bg-danger/80' },
    { label: "2022", value: 18, height: '40%', color: 'bg-primary/60', hover: 'group-hover:bg-primary/80' },
    { label: "2023", value: 42, height: '85%', color: 'bg-danger', hover: 'group-hover:bg-danger' },
  ]
}

export default function TimelineChart() {
  const [timeframe, setTimeframe] = useState<keyof typeof DUMMY_DATA>('Last 12 Months')

  const currentData = useMemo(() => DUMMY_DATA[timeframe], [timeframe])

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bar_chart</span>
          Riwayat Aktivitas Laporan
        </h3>
        <select 
          className="bg-background-dark border-none text-slate-300 text-sm rounded-lg focus:ring-0 cursor-pointer"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as keyof typeof DUMMY_DATA)}
        >
          <option value="Last 12 Months">12 Bulan Terakhir</option>
          <option value="Last 30 Days">30 Hari Terakhir</option>
          <option value="All Time">Semua Waktu</option>
        </select>
      </div>

      {/* CSS Chart */}
      <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
        {currentData.map((item, idx) => (
          <div key={idx} className="w-full h-full flex items-end bg-slate-800/50 rounded-t-sm relative group cursor-pointer hover:bg-slate-700 transition-colors">
            <div 
              className={`bar-animate absolute bottom-0 left-0 right-0 ${item.color} ${item.hover} rounded-t-sm mx-1 sm:mx-0.5`} 
              style={{ '--h': item.height } as React.CSSProperties}
            ></div>
            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10 flex flex-col items-center shadow-xl">
              <span className="font-bold">{item.label}</span>
              <span className="text-slate-400">{item.value} Laporan {'note' in item && item.note ? `(${item.note})` : ''}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
        <span>{currentData[0].label}</span>
        <span>{currentData[Math.floor(currentData.length / 2)].label}</span>
        <span>{currentData[currentData.length - 1].label}</span>
      </div>
    </section>
  )
}
