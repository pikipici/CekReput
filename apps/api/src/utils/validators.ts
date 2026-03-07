import { z } from 'zod'
import { ACCOUNT_TYPES, REPORT_CATEGORIES } from './constants.js'

// ─── Auth Schemas ────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter').max(128),
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token required'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(255).optional(),
  avatarUrl: z.string().url('URL avatar tidak valid').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),
})

export const verifyOtpSchema = z.object({
  email: z.string().email('Email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
})

export const resendOtpSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
  newPassword: z.string().min(8, 'Kata sandi minimal 8 karakter').max(128),
})

// ─── Report Schemas ──────────────────────────────────────────────

export const createReportSchema = z.object({
  accountType: z.enum(ACCOUNT_TYPES),
  accountNumber: z.string().max(100).optional(),
  phoneNumber: z.string().max(50).optional(),
  entityName: z.string().max(255).optional(),
  bankName: z.string().max(100).optional(),
  category: z.enum(REPORT_CATEGORIES),
  chronology: z.string().min(100, 'Kronologi minimal 100 karakter').max(5000),
  incidentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
  socialMedia: z.array(z.string()).optional(),
  lossAmount: z.number().int().min(0).optional(),
  evidenceFiles: z.array(z.object({
    url: z.string(),
    name: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number()
  })).optional(),
  evidenceLink: z.string().url('Format link tidak valid').optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Turnstile token wajib diisi (verifikasi anti-bot)'),
}).refine(
  (data) => data.accountNumber || data.phoneNumber || data.entityName,
  { message: 'Minimal satu identitas pelaku harus diisi (rekening, telepon, atau nama)' }
)

// ─── Search Schema ───────────────────────────────────────────────

export const searchSchema = z.object({
  q: z.string().min(3, 'Query minimal 3 karakter').max(100),
  filter: z.string().optional(),
})

// ─── Comment Schema ──────────────────────────────────────────────

export const createCommentSchema = z.object({
  perpetratorId: z.string().uuid('ID pelaku tidak valid'),
  content: z.string().min(10, 'Komentar minimal 10 karakter').max(2000),
  turnstileToken: z.string().min(1, 'Turnstile token wajib diisi (verifikasi anti-bot)'),
})

export const voteSchema = z.object({
  type: z.enum(['up', 'down']),
})

// ─── Clarification Schema ───────────────────────────────────────

export const createClarificationSchema = z.object({
  perpetratorId: z.string().uuid('ID pelaku tidak valid'),
  statement: z.string().min(50, 'Pernyataan minimal 50 karakter').max(5000),
  identityPhotoUrl: z.string().url('URL foto KTP tidak valid'),
  selfiePhotoUrl: z.string().url('URL foto Selfie tidak valid'),
  identityName: z.string().min(3, 'Nama KTP minimal 3 karakter').max(255),
  identityNik: z.string().min(16, 'NIK harus 16 digit').max(50),
  relationType: z.string().min(3, 'Hubungan minimal 3 karakter').max(100),
  evidenceUrls: z.array(z.string().url('URL bukti tidak valid')).max(5).optional(),
})

// ─── Moderation Schema ──────────────────────────────────────────

export const moderateReportSchema = z.object({
  action: z.enum(['verify', 'reject']),
  rejectionReason: z.string().max(500).optional(),
  evidenceFiles: z.array(z.object({
    url: z.string(),
    name: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number()
  })).optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.rejectionReason && data.rejectionReason.length > 0),
  { message: 'Alasan penolakan wajib diisi saat menolak laporan' }
)

export const moderateClarificationSchema = z.object({
  action: z.enum(['approve', 'reject']),
  resetThreat: z.boolean().default(false),
})

// ─── API Key Schema ─────────────────────────────────────────────

export const createApiKeySchema = z.object({
  label: z.string().min(3, 'Label minimal 3 karakter').max(100),
})

// ─── Pagination Schema ──────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
