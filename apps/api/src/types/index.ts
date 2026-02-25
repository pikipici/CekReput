import type { JwtPayload } from '../middleware/auth.js'

// Extend Hono's context variables to provide type safety for c.get/c.set
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload
    apiKey: {
      id: string
      userId: string
      keyHash: string
      label: string
      rateLimitPerMin: number
      isActive: boolean
      lastUsedAt: Date | null
      createdAt: Date
    }
  }
}
