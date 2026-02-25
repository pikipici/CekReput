import { Link } from 'react-router-dom'

export default function ResultHeader() {
  return (
    <>
      {/* Breadcrumbs / Back */}
      <div className="mb-8 flex items-center gap-2 text-sm text-slate-400">
        <Link className="hover:text-primary flex items-center gap-1" to="/">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Search
        </Link>
        <span>/</span>
        <span className="text-white">Results</span>
      </div>

      {/* Search Query Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">0812-3456-7890</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">public</span>
            Telkomsel • Jakarta Region
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-surface-dark px-3 py-1 rounded-full border border-[#2f6a5e]/50">
          <span className="material-symbols-outlined text-sm">history</span>
          Last reported 2 hours ago
        </div>
      </div>
    </>
  )
}
