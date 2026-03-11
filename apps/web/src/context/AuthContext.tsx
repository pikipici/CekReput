import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, type User } from '../lib/api'

interface GoogleUserData {
  email: string
  name: string
  googleId: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ error?: string; requiresOtp?: boolean; email?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string; requiresOtp?: boolean; email?: string }>
  verifyEmail: (email: string, code: string) => Promise<{ error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ error?: string; requiresRegistration?: boolean; googleData?: GoogleUserData }>
  registerWithGoogle: (name: string, email: string, password: string, googleId: string, avatarUrl?: string) => Promise<{ error?: string }>
  forgotPassword: (email: string) => Promise<{ error?: string; message?: string }>
  checkResetOtp: (email: string, code: string) => Promise<{ error?: string; message?: string }>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ error?: string; message?: string }>
  logout: () => void
  updateUser: (updatedUser: Partial<User>) => void
  refreshToken: () => Promise<{ success: boolean; error?: string }>
  isTokenExpiring: (thresholdMinutes?: number) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'cekreput_access_token'
const REFRESH_KEY = 'cekreput_refresh_token'
const USER_KEY = 'cekreput_user'

// ─── JWT Helper Functions ──────────────────────────────────────

/**
 * Decode JWT token and extract expiry time
 */
function getTokenExpiry(token: string): number | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.exp ? payload.exp * 1000 : null // convert to milliseconds
  } catch {
    return null
  }
}

/**
 * Check if token is expiring within threshold (default 5 minutes)
 */
function isTokenExpiringSoon(token: string, thresholdMinutes = 5): boolean {
  const expiryTime = getTokenExpiry(token)
  if (!expiryTime) return false
  
  const now = Date.now()
  const threshold = thresholdMinutes * 60 * 1000
  const timeUntilExpiry = expiryTime - now
  
  // Token is expiring soon if less than threshold remains
  return timeUntilExpiry <= threshold && timeUntilExpiry > 0
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(false)

  // Persist to localStorage
  const saveAuth = useCallback((userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  const clearAuth = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  // Verify token on mount
  useEffect(() => {
    if (token) {
      authApi.me(token).then(({ data, error, status }) => {
        if (error || !data) {
          // If network error (0) or server error (50x), DO NOT log out.
          if (status === 0 || status >= 500) {
            console.warn('Network or server error while auto-logging in, preserving local auth state.')
            return
          }

          // Try refresh for 401 or other explicit auth failures
          const refreshToken = localStorage.getItem(REFRESH_KEY)
          if (refreshToken) {
            authApi.refresh(refreshToken).then(({ data: refreshData, status: refStatus }) => {
              if (refreshData) {
                setToken(refreshData.accessToken)
                localStorage.setItem(TOKEN_KEY, refreshData.accessToken)
                localStorage.setItem(REFRESH_KEY, refreshData.refreshToken)
              } else {
                // Only clear if auth explicitly failed
                if (refStatus !== 0 && refStatus < 500) clearAuth()
              }
            })
          } else {
            clearAuth()
          }
        } else {
          setUser(data.user)
          localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        }
      })
    }
  }, [])

  // ─── Proactive Token Refresh (5 minutes before expiry) ────────

  useEffect(() => {
    if (!token) return

    const checkExpiryAndRefresh = () => {
      if (isTokenExpiringSoon(token, 5)) {
        const refreshTokenStored = localStorage.getItem(REFRESH_KEY)
        if (refreshTokenStored && user) {
          console.log('[AuthContext] Token expiring soon, auto-refreshing...')
          authApi.refresh(refreshTokenStored).then(({ data }) => {
            if (data) {
              // Update tokens, keep existing user data
              const userData = data.user || user
              setUser(userData)
              setToken(data.accessToken)
              localStorage.setItem(TOKEN_KEY, data.accessToken)
              localStorage.setItem(REFRESH_KEY, data.refreshToken)
              localStorage.setItem(USER_KEY, JSON.stringify(userData))
              console.log('[AuthContext] Token refreshed successfully')
            }
          }).catch(err => {
            console.error('[AuthContext] Auto-refresh failed:', err)
          })
        }
      }
    }

    // Check immediately
    checkExpiryAndRefresh()
    
    // Check every 30 seconds
    const interval = setInterval(checkExpiryAndRefresh, 30 * 1000)

    return () => clearInterval(interval)
  }, [token, user, saveAuth])

  // ─── Manual Token Refresh Method ─────────────────────────────

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error, status } = await authApi.login({ email, password })
    setIsLoading(false)

    // Check for requiresOtp from 403 Forbidden payload
    if (status === 403 && error === 'Email belum diverifikasi') {
       return { requiresOtp: true, email }
    }

    if (error || !data) {
      return { error: error ?? 'Login gagal' }
    }

    if (data.requiresOtp) {
      return { requiresOtp: true, email: data.email ?? email }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return {}
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.register({ name, email, password })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Registrasi gagal' }
    }

    if (data.requiresOtp) {
      return { requiresOtp: true, email: data.email ?? email }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return {}
  }

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.verifyEmail({ email, code })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Verifikasi gagal' }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return {}
  }

  const logout = () => {
    clearAuth()
  }

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.googleLogin(idToken)
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Login Google gagal' }
    }

    if (data.requiresRegistration) {
      return { requiresRegistration: true, googleData: data.googleData }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return {}
  }

  const registerWithGoogle = async (name: string, email: string, password: string, googleId: string, avatarUrl?: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.googleRegister({ name, email, password, googleId, avatarUrl })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Registrasi Google gagal' }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return {}
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.forgotPassword({ email })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Permintaan gagal' }
    }

    return { message: data.message }
  }

  const checkResetOtp = async (email: string, code: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.checkResetOtp({ email, code })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Kode OTP tidak valid' }
    }

    return { message: data.message }
  }

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true)
    const { data, error } = await authApi.resetPassword({ email, code, newPassword })
    setIsLoading(false)

    if (error || !data) {
      return { error: error ?? 'Gagal mereset kata sandi' }
    }

    saveAuth(data.user, data.accessToken, data.refreshToken)
    return { message: data.message }
  }

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return
    const newUser = { ...user, ...updatedUser }
    setUser(newUser)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  // ─── Manual Token Refresh ─────────────────────────────────────

  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    const refreshTokenStored = localStorage.getItem(REFRESH_KEY)
    if (!refreshTokenStored) {
      return { success: false, error: 'Tidak ada refresh token tersedia' }
    }

    try {
      const { data, error } = await authApi.refresh(refreshTokenStored)
      if (error || !data) {
        return { success: false, error: error || 'Gagal refresh token' }
      }

      // Update tokens, keep existing user data
      const userData = data.user || user
      setUser(userData)
      setToken(data.accessToken)
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem(REFRESH_KEY, data.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      return { success: true }
    } catch {
      return { success: false, error: 'Terjadi kesalahan jaringan' }
    }
  }

  const isTokenExpiring = (thresholdMinutes = 5): boolean => {
    if (!token) return true
    return isTokenExpiringSoon(token, thresholdMinutes)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        verifyEmail,
        loginWithGoogle,
        registerWithGoogle,
        forgotPassword,
        checkResetOtp,
        resetPassword,
        logout,
        updateUser,
        refreshToken,
        isTokenExpiring,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
