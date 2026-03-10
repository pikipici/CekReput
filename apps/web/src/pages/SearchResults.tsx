import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

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
  matchedGameId?: string | null
  matchedGameType?: string | null
}

const threatConfig: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
  danger: { label: 'Bahaya', color: 'text-rose-400', icon: 'gpp_bad', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  warning: { label: 'Waspada', color: 'text-amber-400', icon: 'warning', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  safe: { label: 'Aman', color: 'text-emerald-400', icon: 'verified_user', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const filterParam = searchParams.get('filter') ?? 'Semua'

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [inputType, setInputType] = useState('')
  const [searchInput, setSearchInput] = useState(query)
  const [searchFilter, setSearchFilter] = useState(filterParam)

  useEffect(() => {
    if (!query) { setLoading(false); return }
    setLoading(true)
    
    let apiUrl = `${API_BASE}/api/check?q=${encodeURIComponent(query)}`
    if (filterParam && filterParam !== 'Semua') {
      apiUrl += `&filter=${encodeURIComponent(filterParam)}`
    }

    fetch(apiUrl)
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
    let url = `/results?q=${encodeURIComponent(q)}`
    if (searchFilter !== 'Semua') {
      url += `&filter=${encodeURIComponent(searchFilter)}`
    }
    window.location.href = url
  }

  return (
    <>
      <SEO
        title={`Hasil Pencarian: ${query || 'Cari Data'}`}
        description={query ? `Hasil pencarian untuk "${query}". Cek reputasi rekening bank, nomor telepon, e-wallet, atau ID game dari database penipuan Indonesia.` : 'Cari data penipuan di database CekReput'}
        keywords={`cek ${query || 'rekening penipu'}, database penipuan, verifikasi laporan`}
        canonical={`https://cekreput.com/results?q=${encodeURIComponent(query || '')}`}
        noIndex={!query}
      />
      <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-surface-darker">
        <Header />

        <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-2">
              <div className="relative min-w-[120px] sm:min-w-[140px] shrink-0">
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-12 pl-10 pr-8 bg-slate-800/50 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="Semua">Semua</option>
                  <option value="Rekening Bank">Rekening Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Nomor Telepon">Nomor Telepon</option>
                  <option value="ID Game">ID Game</option>
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">filter_list</span>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
              </div>
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[22px]">search</span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder={
                    searchFilter === 'Rekening Bank' ? 'Masukkan nomor rekening bank...' :
                    searchFilter === 'E-Wallet' ? 'Masukkan nomor e-wallet...' :
                    searchFilter === 'Nomor Telepon' ? 'Masukkan nomor telepon...' :
                    searchFilter === 'ID Game' ? 'Masukkan ID game...' :
                    'Cari nomor rekening, telepon, atau ID game...'
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto h-12 px-4 sm:px-6 bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
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
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">{inputType}</span>
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
            <div className="space-y-8">
              {/* Group results: ID Game section first, then other results */}
              {(() => {
                const gameResults = results.filter(r => r.matchedGameId && r.matchedGameType)
                const otherResults = results.filter(r => !r.matchedGameId)

                return (
                  <>
                    {/* Section 1: ID Game */}
                    {gameResults.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                          <span className="material-symbols-outlined text-primary text-[22px]">sports_esports</span>
                          <h2 className="text-lg font-bold text-white">ID Game</h2>
                          <span className="text-sm text-slate-400">({gameResults.length})</span>
                        </div>
                        {gameResults.map((item) => {
                          const threat = threatConfig[item.threatLevel] ?? threatConfig.safe
                          const linkTo = `/game/${encodeURIComponent(item.matchedGameType!)}/${encodeURIComponent(item.matchedGameId!)}`

                          return (
                            <Link
                              key={item.id}
                              to={linkTo}
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
                                        {item.matchedGameId}
                                      </span>
                                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${threat.bg} ${threat.border} ${threat.color}`}>
                                        {threat.label}
                                      </span>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">sports_esports</span>
                                        {item.matchedGameType}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">description</span>
                                        {item.totalReports} laporan
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        {item.verifiedReports} terverifikasi
                                      </span>
                                    </div>

                                    {/* Date Range */}
                                    {item.firstReported && (
                                      <p className="text-xs text-slate-500">
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
                      </section>
                    )}

                    {/* Section 2: Other Results */}
                    {otherResults.length > 0 && (
                      <section className="space-y-4">
                        {otherResults.map((item) => {
                          const threat = threatConfig[item.threatLevel] ?? threatConfig.safe
                          const linkTo = `/profile/${item.id}`

                          return (
                            <Link
                              key={item.id}
                              to={linkTo}
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
                                      {item.bankName ? (
                                        <span className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-[14px]">account_balance</span>
                                          {item.bankName}
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 capitalize">
                                          <span className="material-symbols-outlined text-[14px]">{item.accountType === 'phone' ? 'smartphone' : 'storefront'}</span>
                                          {item.accountType}
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
                                    </div>

                                    {/* Date Range */}
                                    {item.firstReported && (
                                      <p className="text-xs text-slate-500">
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
                      </section>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
    </>
  )
}
