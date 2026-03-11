/**
 * CekReput API Client
 * Central utility for all frontend-to-backend API communication.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
  headers?: Record<string, string>
}

interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Generic fetch wrapper with JWT auth and error handling.
 */
async function request<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config)
    const data = await res.json()

    if (!res.ok) {
      console.error('API Error Response:', data)
      let errorMessage = data.error ?? data.message ?? 'Terjadi kesalahan'

      // Parse Zod error objects
      if (typeof data.error === 'object' && data.error !== null) {
        if (Array.isArray(data.error.issues)) {
          errorMessage = data.error.issues.map((i: { message?: string }) => i.message ?? 'Invalid input').join(', ')
        } else if (Array.isArray(data.error)) {
          errorMessage = data.error.map((i: { message?: string }) => i.message ?? 'Unknown error').join(', ')
        } else {
          errorMessage = JSON.stringify(data.error)
        }
      }

      return { data: null, error: errorMessage, status: res.status }
    }

    return { data: data as T, error: null, status: res.status }
  } catch (err) {
    console.error('API Fetch Exception:', err)
    return { data: null, error: 'Tidak dapat terhubung ke server', status: 0 }
  }
}

// ─── Auth API ────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  avatarUrl?: string | null
  badges?: string[] | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  message?: string
  requiresRegistration?: boolean
  googleData?: {
    email: string
    name: string
    googleId: string
    avatarUrl: string
  }
  requiresOtp?: boolean
  email?: string
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: data }),

  googleLogin: (idToken: string) =>
    request<AuthResponse>('/api/auth/google', { method: 'POST', body: { idToken } }),

  googleRegister: (data: { name: string; email: string; password: string; googleId: string; avatarUrl?: string }) =>
    request<AuthResponse>('/api/auth/google-register', { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string; user?: User }>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

  verifyEmail: (data: { email: string; code: string }) =>
    request<AuthResponse>('/api/auth/verify-email', { method: 'POST', body: data }),

  resendOtp: (data: { email: string }) =>
    request<{ message: string }>('/api/auth/resend-otp', { method: 'POST', body: data }),

  forgotPassword: (data: { email: string }) =>
    request<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: data }),

  checkResetOtp: (data: { email: string; code: string }) =>
    request<{ message: string }>('/api/auth/check-reset-otp', { method: 'POST', body: data }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    request<AuthResponse>('/api/auth/reset-password', { method: 'POST', body: data }),

  me: (token: string) =>
    request<{ user: User }>('/api/auth/me', { token }),
}

// ─── Check / Search API ─────────────────────────────────────────

export interface Perpetrator {
  id: string
  accountNumber: string
  phoneNumber: string
  entityName: string
  bankName: string | null
  accountType: 'bank' | 'ewallet' | 'phone'
  threatLevel: 'safe' | 'warning' | 'danger'
  totalReports: number
  verifiedReports: number
  totalLoss: number
  firstReported: string | null
  lastReported: string | null
  socialMedia: string | null
}

export interface SearchResponse {
  query: string
  type: 'phone' | 'account' | 'name'
  count: number
  results: Perpetrator[]
}

export const checkApi = {
  search: (query: string) =>
    request<SearchResponse>(`/api/check?q=${encodeURIComponent(query)}`),
}

// ─── Reports API ─────────────────────────────────────────────────

export interface EvidenceFile {
  id: string
  reportId: string
  fileUrl: string
  fileName: string
  mimeType: string
  fileSizeBytes: number
  uploadedAt: string
}

export interface Report {
  id: string
  perpetratorId: string
  reporterId: string
  category: string
  chronology: string
  incidentDate: string
  lossAmount: number | null
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
  evidence?: EvidenceFile[]
  reporterName?: string
}

export interface Clarification {
  id: string
  perpetratorId: string
  requesterId: string
  statement: string
  status: 'pending' | 'approved' | 'rejected'
  evidenceUrls: string[] | null
  identityPhotoUrl: string | null
  selfiePhotoUrl: string | null
  identityName: string | null
  identityNik: string | null
  relationType: string | null
  createdAt: string
  // Additional fields from admin endpoint
  perpetratorData?: { accountNumber: string | null; phoneNumber: string | null; entityName: string | null; bankName: string | null }
  perpetratorPhone?: string
  perpetratorName?: string
  requesterName?: string
  requesterEmail?: string
}

export const reportsApi = {
  create: (data: {
    accountType: string
    accountNumber?: string
    phoneNumber?: string
    entityName?: string
    bankName?: string
    category: string
    chronology: string
    incidentDate: string
  }, token: string) =>
    request('/api/reports', { method: 'POST', body: data, token }),

  myReports: (token: string, page = 1) =>
    request<{ reports: Report[] }>(`/api/reports/my?page=${page}`, { token }),

  getById: (id: string) =>
    request<{ report: Report }>(`/api/reports/${id}`),
}

// ─── Perpetrators API ────────────────────────────────────────────

export const perpetratorsApi = {
  getById: (id: string) =>
    request<{ perpetrator: Perpetrator }>(`/api/perpetrators/${id}`),

  getReports: (id: string, page = 1) =>
    request<{ reports: Report[] }>(`/api/perpetrators/${id}/reports?page=${page}`),

  getVerifiedEvidence: (id: string) =>
    request<{ verifiedEvidence: Array<{ id: string; incidentDate: string; createdAt: string; evidenceFiles: Array<{ id: string; fileUrl: string; mimeType: string }> }> }>(`/api/perpetrators/${id}/verified-evidence`),

  getTimeline: (id: string) =>
    request(`/api/perpetrators/${id}/timeline`),

  getClarifications: (id: string) =>
    request<{ clarifications: Clarification[] }>(`/api/perpetrators/${id}/clarifications`),

  getComments: (id: string, page = 1) =>
    request<{ comments: UserComment[]; page: number; limit: number }>(`/api/perpetrators/${id}/comments?page=${page}`),
}

// ─── Comments API ────────────────────────────────────────────────

export interface UserComment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  createdAt: string
  perpetrator: {
    id: string
    entityName: string | null
    accountNumber: string | null
    phoneNumber: string | null
    bankName: string | null
  }
}

export const commentsApi = {
  create: (data: { perpetratorId: string; content: string; turnstileToken?: string }, token: string) =>
    request('/api/comments', { method: 'POST', body: data, token }),

  vote: (id: string, type: 'up' | 'down', token: string) =>
    request(`/api/comments/${id}/vote`, { method: 'POST', body: { type }, token }),

  delete: (id: string, token: string) =>
    request(`/api/comments/${id}`, { method: 'DELETE', token }),
}

// ─── Users API ───────────────────────────────────────────────────

export const usersApi = {
  getProfile: (token: string) =>
    request<{ user: { id: string; name: string; email: string; avatarUrl: string | null; bio: string | null; role: string; createdAt: string }; stats: { totalReports: number; verifiedReports: number } }>('/api/users/profile', { token }),

  updateProfile: (data: { name?: string; avatarUrl?: string; bio?: string }, token: string) =>
    request('/api/users/profile', { method: 'PATCH', body: data, token }),

  getComments: (token: string, page = 1) =>
    request<{ comments: Array<{ id: string; content: string; upvotes: number; downvotes: number; createdAt: string; perpetrator: { id: string; entityName: string | null; accountNumber: string | null; phoneNumber: string | null; bankName: string | null } }>; page: number; limit: number; hasMore: boolean }>(`/api/users/comments?page=${page}`, { token }),
}

// ─── Clarifications API ──────────────────────────────────────────

export interface CreateClarificationData {
  perpetratorId: string
  statement: string
  evidenceUrls?: string[]
  identityPhotoUrl?: string
  selfiePhotoUrl?: string
  identityName?: string
  identityNik?: string
  relationType?: string
}

export const clarificationsApi = {
  create: (data: CreateClarificationData, token: string) =>
    request('/api/clarifications', { method: 'POST', body: data, token }),

  getPending: (page = 1, token: string) =>
    request(`/api/clarifications/admin/pending?page=${page}`, { token }),

  moderate: (id: string, data: { action: 'approve' | 'reject'; resetThreat?: boolean }, token: string) =>
    request(`/api/clarifications/admin/${id}`, { method: 'PATCH', body: data, token }),
}
