import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface GamePerpetrator {
  id: string
  accountNumber: string | null
  phoneNumber: string | null
  entityName: string | null
  bankName: string | null
  accountType: 'bank' | 'ewallet' | 'phone'
  threatLevel: 'safe' | 'warning' | 'danger'
  totalReports: number
  verifiedReports: number
  firstReported: string | null
  lastReported: string | null
  totalLoss: number | null
}

interface GameData {
  platform: string
  gameId: string
  totalPerpetrators: number
  totalReports: number
  totalVerifiedReports: number
  totalLoss: number
  firstReported: string | null
  lastReported: string | null
  threatLevel: 'safe' | 'warning' | 'danger'
}

const threatConfig: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
  danger: { label: 'Bahaya', color: 'text-rose-400', icon: 'gpp_bad', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  warning: { label: 'Waspada', color: 'text-amber-400', icon: 'warning', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  safe: { label: 'Aman', color: 'text-emerald-400', icon: 'verified_user', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

export default function GameDetail() {
  const { platform, gameId } = useParams<{ platform: string; gameId: string }>()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [perpetrators, setPerpetrators] = useState<GamePerpetrator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!platform || !gameId) return

    setLoading(true)
    fetch(`${API_BASE}/api/game/${encodeURIComponent(platform)}/${encodeURIComponent(gameId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.game && data.perpetrators) {
          setGameData(data.game)
          setPerpetrators(data.perpetrators)
        }
      })
      .catch(() => {
        setGameData(null)
        setPerpetrators([])
      })
      .finally(() => setLoading(false))
  }, [platform, gameId])

  if (!platform || !gameId) {
    return null
  }

  const threat = threatConfig[gameData?.threatLevel ?? 'safe'] ?? threatConfig.safe

  return (
    <>
      <SEO
        title={`${platform}: ${gameId} - Database Penipuan Game`}
        description={gameData ? `ID Game ${platform}: ${gameId} memiliki ${gameData.totalReports} laporan (${gameData.totalVerifiedReports} terverifikasi) dari ${gameData.totalPerpetrators} laporan terkait. Tingkat ancaman: ${threat.label}.` : `Cek reputasi ID Game ${platform}: ${gameId}`}
        keywords={`cek ${platform} ${gameId}, ${platform} penipu, database penipuan game, ${platform} scam`}
        canonical={`https://cekreput.com/game/${encodeURIComponent(platform)}/${encodeURIComponent(gameId)}`}
      />
      <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display selection:bg-primary selection:text-surface-darker">
        <Header />

        <main className="flex-grow">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
              </div>
            )}

            {/* Not Found */}
            {!loading && !gameData && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
                  <span className="material-symbols-outlined text-rose-400 text-4xl">gpp_bad</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">ID Game Tidak Ditemukan</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  ID Game <span className="font-mono text-primary">{platform}: {gameId}</span> tidak ditemukan dalam database kami.
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

            {/* Content */}
            {!loading && gameData && (
              <>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                  <Link className="hover:text-primary" to="/results">Hasil Pencarian</Link>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span className="text-white font-medium">{gameData.platform}: {gameData.gameId}</span>
                </div>

                {/* Hero Section */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-16 h-16 rounded-xl ${threat.bg} border ${threat.border} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-[32px] ${threat.color}`}>{threat.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h1 className="text-2xl font-bold text-white">{gameData.platform}: {gameData.gameId}</h1>
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md border ${threat.bg} ${threat.border} ${threat.color}`}>
                          {threat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span className="text-white font-medium">{gameData.totalPerpetrators}</span> laporan terkait
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">description</span>
                          <span className="text-white font-medium">{gameData.totalReports}</span> laporan
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span className="text-white font-medium">{gameData.totalVerifiedReports}</span> terverifikasi
                        </span>
                        {gameData.totalLoss > 0 && (
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            <span className="text-white font-medium">Rp {gameData.totalLoss.toLocaleString('id-ID')}</span> total kerugian
                          </span>
                        )}
                      </div>
                      {gameData.firstReported && (
                        <p className="text-xs text-slate-500 mt-3">
                          Pertama dilaporkan: {new Date(gameData.firstReported).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {gameData.lastReported && gameData.lastReported !== gameData.firstReported && (
                            <> — Terakhir: {new Date(gameData.lastReported).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Perpetrators List */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
                    Laporan Terkait ({perpetrators.length})
                  </h2>

                  {perpetrators.map((perp) => {
                    const perpThreat = threatConfig[perp.threatLevel] ?? threatConfig.safe
                    const displayName = perp.bankName
                      ? `${perp.bankName} ${perp.accountNumber?.slice(0, 4) ?? '****'}${'*'.repeat(Math.max(0, (perp.accountNumber?.length ?? 4) - 7))}${perp.accountNumber?.slice(-3) ?? '***'}`
                      : perp.phoneNumber
                        ? `${perp.phoneNumber.slice(0, 4)}-${perp.phoneNumber.slice(4, 6)}**-****`
                        : perp.entityName ?? 'Unknown'

                    return (
                      <Link
                        key={perp.id}
                        to={`/profile/${perp.id}`}
                        className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`shrink-0 w-12 h-12 rounded-xl ${perpThreat.bg} border ${perpThreat.border} flex items-center justify-center`}>
                              <span className={`material-symbols-outlined text-[24px] ${perpThreat.color}`}>
                                {perp.accountType === 'bank' ? 'account_balance' : perp.accountType === 'ewallet' ? 'account_balance_wallet' : 'smartphone'}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-base font-bold text-white">{displayName}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${perpThreat.bg} ${perpThreat.border} ${perpThreat.color}`}>
                                  {perpThreat.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">
                                    {perp.accountType === 'bank' ? 'account_balance' : perp.accountType === 'ewallet' ? 'account_balance_wallet' : 'smartphone'}
                                  </span>
                                  {perp.accountType === 'bank' && perp.bankName}
                                  {perp.accountType === 'ewallet' && 'E-Wallet'}
                                  {perp.accountType === 'phone' && 'Telepon'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">description</span>
                                  {perp.totalReports} laporan
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  {perp.verifiedReports} terverifikasi
                                </span>
                              </div>
                              {perp.firstReported && (
                                <p className="text-xs text-slate-500">
                                  Dilaporkan: {new Date(perp.firstReported).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                  {perp.lastReported && perp.lastReported !== perp.firstReported && (
                                    <> — {new Date(perp.lastReported).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-[20px] mt-3">
                            arrow_forward
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
