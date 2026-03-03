// Shared enums and type constants

export const ACCOUNT_TYPES = ['bank', 'ewallet', 'phone'] as const
export type AccountType = typeof ACCOUNT_TYPES[number]

export const THREAT_LEVELS = ['safe', 'warning', 'danger'] as const
export type ThreatLevel = typeof THREAT_LEVELS[number]

export const REPORT_CATEGORIES = [
  'marketplace',
  'investasi',
  'pinjol',
  'phishing',
  'cod',
  'lowker',
  'romance',
  'hackback',
  'other',
] as const
export type ReportCategory = typeof REPORT_CATEGORIES[number]

export const REPORT_STATUSES = ['pending', 'verified', 'rejected'] as const
export type ReportStatus = typeof REPORT_STATUSES[number]

export const USER_ROLES = ['user', 'moderator', 'admin'] as const
export type UserRole = typeof USER_ROLES[number]

export const CLARIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const
export type ClarificationStatus = typeof CLARIFICATION_STATUSES[number]

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  marketplace: 'Penipuan Marketplace / Jual Beli Online',
  investasi: 'Investasi Bodong',
  pinjol: 'Pinjaman Online Ilegal',
  phishing: 'Phishing / Social Engineering',
  cod: 'COD Fiktif',
  lowker: 'Penipuan Lowongan Kerja',
  romance: 'Romance Scam',
  hackback: 'HackBack Akun',
  other: 'Lainnya',
}

export const THREAT_LEVEL_LABELS: Record<ThreatLevel, string> = {
  safe: 'Aman — Tidak Ada Laporan',
  warning: 'Waspada — Ada 1-2 Laporan',
  danger: 'Bahaya — 3+ Laporan Terverifikasi',
}
