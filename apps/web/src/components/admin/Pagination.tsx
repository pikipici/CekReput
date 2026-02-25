interface PaginationProps {
  page: number
  limit: number
  count: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, limit, count, onPageChange }: PaginationProps) {
  const hasNext = count >= limit
  const hasPrev = page > 1

  if (count === 0 && page === 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-slate-500 tabular-nums">
        Menampilkan {(page - 1) * limit + 1}–{(page - 1) * limit + count} data
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          Sebelumnya
        </button>
        <span className="px-3 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg tabular-nums min-w-[40px] text-center">
          {page}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          Berikutnya
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
