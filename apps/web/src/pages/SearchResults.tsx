import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface SearchResult {
  id: string
  accountNumber: string | null
  phoneNumber: string | null
  entityName: string | null
  bankName: string | null
  accountType: string
  threatLevel: string
  totalReports: number
  verifiedReports: number
  firstReported: string | null
  lastReported: string | null
}

const threatConfig: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
  danger: { label: 'Bahaya', color: 'text-rose-400', icon: 'gpp_bad', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  warning: { label: 'Waspada', color: 'text-amber-400', icon: 'warning', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  safe: { label: 'Aman', color: 'text-emerald-400', icon: 'verified_user', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [inputType, setInputType] = useState('')
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    fetch(`${API_BASE}/api/check?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results ?? [])
        setInputType(data.type ?? '')
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (!q) return
    window.location.href = `/results?q=${encodeURIComponent(q)}`
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-surface-darker">
      <Header />

      <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[22px]">search</span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Cari nomor rekening, e-wallet, atau telepon..."
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Cari
              </button>
            </div>
          </form>

          {/* Result Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              Hasil Pencarian
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? 'Mencari...' : (
                <>
                  Ditemukan <span className="font-semibold text-white">{results.length}</span> hasil untuk{' '}
                  <span className="font-mono text-primary">"{query}"</span>
                  {inputType === 'name' ? (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      ⚠ Tidak bisa mencari berdasarkan nama
                    </span>
                  ) : inputType ? (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{inputType}</span>
                  ) : null}
                </>
              )}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-48">
              <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <span className="material-symbols-outlined text-emerald-400 text-4xl">verified_user</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Tidak Ditemukan</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Data <span className="font-mono text-primary">"{query}"</span> tidak ditemukan dalam database kami. Ini bisa berarti identitas tersebut belum pernah dilaporkan.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Kembali ke Beranda
              </Link>
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((item) => {
                const threat = threatConfig[item.threatLevel] ?? threatConfig.safe
                return (
                  <Link
                    key={item.id}
                    to={`/profile/${item.id}`}
                    className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Threat Icon */}
                        <div className={`shrink-0 w-12 h-12 rounded-xl ${threat.bg} border ${threat.border} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-[24px] ${threat.color}`}>{threat.icon}</span>
                        </div>

                        {/* Info */}
                        <div className="space-y-1.5">
                          {/* Identity */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-base font-bold text-white">
                              {item.accountNumber ?? item.phoneNumber ?? item.entityName ?? '—'}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${threat.bg} ${threat.border} ${threat.color}`}>
                              {threat.label}
                            </span>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {item.bankName && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">account_balance</span>
                                {item.bankName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">description</span>
                              {item.totalReports} laporan
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              {item.verifiedReports} terverifikasi
                            </span>
                            <span className="capitalize">{item.accountType}</span>
                          </div>

                          {/* Date Range */}
                          {item.firstReported && (
                            <p className="text-xs text-slate-600">
                              Dilaporkan: {new Date(item.firstReported).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                              {item.lastReported && item.lastReported !== item.firstReported && (
                                <> — {new Date(item.lastReported).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-[20px] mt-3">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
