import { useState, useMemo, useEffect } from 'react'
import { perpetratorsApi } from '../../lib/api'

interface TimelineChartProps {
  perpetratorId?: string
}

interface TimelineItem {
  id: string
  category: string
  status: string
  incidentDate: string
  createdAt: string
}

type Timeframe = 'Last 12 Months' | 'Last 30 Days' | 'All Time'

interface ChartDataPoint {
  label: string
  value: number
  height: string
  color: string
  hover: string
  note?: string
}

export default function TimelineChart({ perpetratorId }: TimelineChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('Last 30 Days')
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!perpetratorId) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    perpetratorsApi.getTimeline(perpetratorId).then((res) => {
      const timelineRes = res.data as { timeline?: TimelineItem[] } | undefined
      if (mounted && timelineRes?.timeline) {
        setTimelineData(timelineRes.timeline)
      }
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [perpetratorId])

  const currentData = useMemo<ChartDataPoint[]>(() => {
    if (!timelineData.length) return []

    const now = new Date()
    const groups: Record<string, number> = {}
    const labels: string[] = []

    if (timeframe === 'Last 30 Days') {
      // Last 30 days including today
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0] // YYYY-MM-DD
        labels.push(key)
        groups[key] = 0
      }
      
      timelineData.forEach(item => {
        const d = new Date(item.createdAt).toISOString().split('T')[0]
        if (groups[d] !== undefined) groups[d]++
      })
    } else if (timeframe === 'Last 12 Months') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        labels.push(key)
        groups[key] = 0
      }

      timelineData.forEach(item => {
        const d = new Date(item.createdAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (groups[key] !== undefined) groups[key]++
      })
    } else {
      // All time (by year)
      const years = timelineData.map(t => new Date(t.incidentDate).getFullYear())
      const minYear = years.length ? Math.min(...years) : now.getFullYear()
      const maxYear = now.getFullYear()
      
      for (let y = minYear; y <= maxYear; y++) {
        labels.push(y.toString())
        groups[y.toString()] = 0
      }

      timelineData.forEach(item => {
        const y = new Date(item.createdAt).getFullYear().toString()
        if (groups[y] !== undefined) groups[y]++
      })
    }

    const maxVal = Math.max(...Object.values(groups), 1)

    return labels.map(key => {
      const val = groups[key]
      const heightPct = Math.max((val / maxVal) * 100, val > 0 ? 10 : 2) // At least 2% to show a tiny stub, 10% if there is data
      
      // Format label for display
      let displayLabel = key
      if (timeframe === 'Last 30 Days') {
        displayLabel = new Date(key).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      } else if (timeframe === 'Last 12 Months') {
        const d = new Date(key + '-01')
        displayLabel = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      }

      // Coloring based on urgency relative to max
      let color = 'bg-primary/30'
      let hover = 'group-hover:bg-primary/50'
      if (val > 0) {
        if (val >= maxVal && val > 2) {
          color = 'bg-danger'
          hover = 'group-hover:bg-danger'
        } else if (val > maxVal * 0.5) {
          color = 'bg-danger/60'
          hover = 'group-hover:bg-danger/80'
        } else {
          color = 'bg-primary/60'
          hover = 'group-hover:bg-primary/80'
        }
      }

      return {
        label: displayLabel,
        value: val,
        height: `${heightPct}%`,
        color,
        hover
      }
    })
  }, [timelineData, timeframe])

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
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        >
          <option value="Last 12 Months">12 Bulan Terakhir</option>
          <option value="Last 30 Days">30 Hari Terakhir</option>
          <option value="All Time">Semua Waktu</option>
        </select>
      </div>

      {loading ? (
        <div className="h-48 w-full flex justify-center items-center">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
        </div>
      ) : currentData.length > 0 ? (
        <>
          {/* CSS Chart */}
          <div className="h-48 w-full flex items-end justify-between gap-[2px] sm:gap-1 px-1 sm:px-2">
            {currentData.map((item, idx) => (
              <div key={idx} className="w-full h-full flex items-end bg-slate-800/20 rounded-t-sm relative group cursor-pointer hover:bg-slate-700/50 transition-colors">
                <div 
                  className={`bar-animate absolute bottom-0 left-0 right-0 ${item.color} ${item.hover} rounded-t-sm`} 
                  style={{ '--h': item.height } as React.CSSProperties}
                ></div>
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10 flex flex-col items-center shadow-xl">
                  <span className="font-bold">{item.label}</span>
                  <span className="text-slate-400">{item.value} Laporan</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-2 px-1 sm:px-2">
            <span>{currentData[0]?.label}</span>
            <span>{currentData[Math.floor(currentData.length / 2)]?.label}</span>
            <span>{currentData[currentData.length - 1]?.label}</span>
          </div>
        </>
      ) : (
        <div className="h-48 w-full flex flex-col justify-center items-center text-slate-500">
           <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
           <p className="text-sm">Belum ada data riwayat laporan</p>
        </div>
      )}
    </section>
  )
}
