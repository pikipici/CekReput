interface UserBadgeProps {
  badges: string[] | null | undefined
  className?: string
}

const BADGE_CONFIG: Record<string, { icon: string, colorClass: string, bgClass: string }> = {
  'Spam Hunter': {
    icon: 'gavel',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10 border-amber-400/20'
  },
  'Elite Tracker': {
    icon: 'radar',
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-400/10 border-blue-400/20'
  },
  'Verify Master': {
    icon: 'verified',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/10 border-emerald-400/20'
  }
}

export default function UserBadge({ badges, className = '' }: UserBadgeProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badgeText) => {
        const config = BADGE_CONFIG[badgeText] || {
          icon: 'stars',
          colorClass: 'text-primary',
          bgClass: 'bg-primary/10 border-primary/20'
        }

        return (
          <div 
            key={badgeText}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bgClass} ${config.colorClass}`}
            title={badgeText}
          >
            <span className="material-symbols-outlined text-[12px]">{config.icon}</span>
            {badgeText}
          </div>
        )
      })}
    </div>
  )
}
