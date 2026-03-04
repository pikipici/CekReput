import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    let url = `/results?q=${encodeURIComponent(q)}`
    if (searchType !== 'all') {
      url += `&filter=${encodeURIComponent(searchType)}`
    }
    navigate(url)
  }

  const getPlaceholder = () => {
    return t(`home.placeholders.${searchType === 'all' ? 'all' : searchType === 'bankAccount' ? 'bankAccount' : searchType === 'eWallet' ? 'eWallet' : searchType === 'phoneNumber' ? 'phoneNumber' : 'gameId'}`)
  }

  return (
    <section className="relative z-10 flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto w-full" aria-labelledby="hero-title">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm" role="status">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-xs font-semibold text-primary tracking-wide uppercase">{t('home.liveDatabase')}</span>
      </div>

      <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
        {t('home.title')}
      </h1>

      <p id="hero-description" className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        {t('home.subtitle')}
      </p>

      {/* Search Component */}
      <div className="w-full max-w-3xl mx-auto relative group">
        {/* Search Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-panel rounded-2xl p-2 sm:p-3 shadow-2xl">
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit} role="search" aria-label="Cari data penipuan">
            {/* Type Selector  */}
            <div className="relative min-w-[140px]">
              <label htmlFor="search-type" className="sr-only">Tipe Pencarian</label>
              <select
                id="search-type"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full h-12 sm:h-14 pl-10 pr-8 bg-background-dark/50 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                aria-label="Pilih tipe pencarian"
              >
                <option value="all">{t('home.searchTypes.all')}</option>
                <option value="bankAccount">{t('home.searchTypes.bankAccount')}</option>
                <option value="eWallet">{t('home.searchTypes.eWallet')}</option>
                <option value="phoneNumber">{t('home.searchTypes.phoneNumber')}</option>
                <option value="gameId">{t('home.searchTypes.gameId')}</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">filter_list</span>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative">
              <label htmlFor="search-query" className="sr-only">Kata Kunci Pencarian</label>
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[24px]" aria-hidden="true">search</span>
              <input
                id="search-query"
                className="w-full h-12 sm:h-14 pl-12 pr-4 bg-background-dark/50 border border-slate-700 text-white placeholder-slate-500 text-base rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder={getPlaceholder()}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-describedby="search-help"
              />
            </div>

            {/* Action Button */}
            <button
              className="h-12 sm:h-14 px-8 bg-primary hover:bg-primary-dark text-background-dark font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
              type="submit"
              disabled={!query.trim()}
              aria-label="Cari data"
            >
              <span>{t('home.searchButton')}</span>
              <span className="material-symbols-outlined text-[20px] font-bold" aria-hidden="true">arrow_forward</span>
            </button>
          </form>
        </div>

        {/* Helper Text */}
        <ul id="search-help" className="flex justify-center flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs text-slate-500 font-medium" role="list">
          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-emerald-500" aria-hidden="true">check_circle</span> {t('home.verifiedData')}</li>
          <li className="hidden sm:flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-emerald-500" aria-hidden="true">lock</span> {t('home.privacySecure')}</li>
          <li className="hidden sm:flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-emerald-500" aria-hidden="true">update</span> {t('home.realtimeUpdate')}</li>
        </ul>

        {/* Evidence Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-primary/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <span className="material-symbols-outlined text-[18px] text-emerald-400" aria-hidden="true">verified</span>
          <span className="text-sm font-semibold text-emerald-300">{t('hero.evidenceBadge')}</span>
        </div>
      </div>
    </section>
  )
}
