import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { reportsApi, type Report } from '../lib/api'
import SEO from '../components/SEO'

export default function MyReportsPage() {
  const { token, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const limit = 10

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
      return
    }

    const fetchReports = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await reportsApi.myReports(token, page)
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          setReports(res.data.reports || [])
          setHasMore((res.data.reports || []).length === limit)
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data laporan')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [token, isLoggedIn, page, navigate])

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><span className="material-symbols-outlined text-[14px]">check_circle</span> Terverifikasi</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20"><span className="material-symbols-outlined text-[14px]">cancel</span> Ditolak</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><span className="material-symbols-outlined text-[14px]">pending</span> Menunggu Review</span>
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <>
      <SEO
        title="Laporan Saya"
        description="Kelola dan pantau semua laporan penipuan yang telah Anda kirimkan ke CekReput."
        canonical="https://cekreput.com/my-reports"
        noIndex={true}
      />
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-primary/30">
        <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 lg:py-16">
        
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold text-white mb-3">Laporan Saya</h1>
          <p className="text-slate-400">
            Daftar seluruh laporan penipuan yang telah Anda buat di platform CekReput.
          </p>
        </div>

        {/* Content */}
        {loading && reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span>
            <p className="text-slate-400 font-medium">Memuat data laporan...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center animate-in fade-in duration-500">
            <span className="material-symbols-outlined text-rose-500 text-4xl mb-2">error</span>
            <p className="text-rose-400 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 ring-8 ring-slate-800/20">
              <span className="material-symbols-outlined text-4xl text-slate-400">description_empty</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Belum ada laporan</h3>
            <p className="text-slate-400 max-w-sm mb-8">
              Anda belum pernah membuat laporan penipuan di CekReput.
            </p>
            <Link 
              to="/report"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 font-semibold group flex items-center gap-2"
            >
              Buat Laporan Baru
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="glass-panel p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(report.status)}
                      <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">category</span>
                        {report.category}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <Link 
                      to={`/profile/${report.perpetratorId}`} 
                      className="group/link block"
                    >
                      <h3 className="text-lg font-bold text-white group-hover/link:text-primary transition-colors mb-2 flex items-center gap-2">
                        Lihat Data Pelaku Terkait
                        <span className="material-symbols-outlined text-[18px] opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all">open_in_new</span>
                      </h3>
                    </Link>

                    <p className="text-slate-300 text-sm line-clamp-2 mt-3 leading-relaxed">
                      "{report.chronology}"
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm bg-slate-800/50 rounded-lg p-3 w-fit border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">payments</span>
                        <span className="text-slate-300 font-medium">
                          Kerugian: <span className="text-white font-bold">{formatCurrency(report.lossAmount)}</span>
                        </span>
                      </div>
                      <div className="w-px h-5 bg-slate-700 hidden sm:block"></div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">event</span>
                        <span className="text-slate-300">
                          Kejadian: <span className="text-white font-medium">{new Date(report.incidentDate).toLocaleDateString('id-ID')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center md:items-start gap-4 md:flex-col">
                     <Link
                       to={`/profile/${report.perpetratorId}`}
                       className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center border border-white/5 group"
                       title="Lihat Detail Pelaku"
                     >
                       <span className="material-symbols-outlined group-hover:scale-110 transition-transform">person_search</span>
                     </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-slate-800 border border-white/10"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Sebelumnya
              </button>
              <span className="text-sm font-medium text-slate-400 bg-slate-800/50 px-4 py-1.5 rounded-lg border border-white/5">
                Halaman {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-slate-800 border border-white/10"
              >
                Selanjutnya
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
    </>
  )
}
