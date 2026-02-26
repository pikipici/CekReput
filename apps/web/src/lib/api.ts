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
      return { data: null, error: data.error ?? 'Terjadi kesalahan', status: res.status }
    }

    return { data: data as T, error: null, status: res.status }
  } catch (err) {
    return { data: null, error: 'Tidak dapat terhubung ke server', status: 0 }
  }
}

// ─── Auth API ────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  avatarUrl?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  message?: string
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: data }),

  googleLogin: (idToken: string) =>
    request<AuthResponse>('/api/auth/google', { method: 'POST', body: { idToken } }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),

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

  getComments: (id: string, page = 1) =>
    request(`/api/perpetrators/${id}/comments?page=${page}`),

  getTimeline: (id: string) =>
    request(`/api/perpetrators/${id}/timeline`),
}

// ─── Comments API ────────────────────────────────────────────────

export const commentsApi = {
  create: (data: { perpetratorId: string; content: string }, token: string) =>
    request('/api/comments', { method: 'POST', body: data, token }),

  vote: (id: string, type: 'up' | 'down', token: string) =>
    request(`/api/comments/${id}/vote`, { method: 'POST', body: { type }, token }),

  delete: (id: string, token: string) =>
    request(`/api/comments/${id}`, { method: 'DELETE', token }),
}
