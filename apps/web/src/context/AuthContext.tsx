import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, type User } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ error?: string; requiresOtp?: boolean; email?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string; requiresOtp?: boolean; email?: string }>
  verifyEmail: (email: string, code: string) => Promise<{ error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ error?: string; requiresRegistration?: boolean; googleData?: any }>
  registerWithGoogle: (name: string, email: string, password: string, googleId: string, avatarUrl?: string) => Promise<{ error?: string }>
  forgotPassword: (email: string) => Promise<{ error?: string; message?: string }>
  checkResetOtp: (email: string, code: string) => Promise<{ error?: string; message?: string }>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ error?: string; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'cekreput_access_token'
const REFRESH_KEY = 'cekreput_refresh_token'
const USER_KEY = 'cekreput_user'

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
