/**
 * Validates a Cloudflare Turnstile token.
 * @param token The turnstile token sent from the client
 * @param ip Optional client IP for better validation
 * @returns boolean indicating success or failure
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const isDev = process.env.NODE_ENV !== 'production'
  
  console.log('[TURNSTILE] Verification started:', {
    isDev,
    nodeEnv: process.env.NODE_ENV
  })

  // ALWAYS use testing secret key in development mode
  // This ensures compatibility with frontend testing sitekey
  const effectiveSecretKey = isDev
    ? '1x0000000000000000000000000000000AA' // Cloudflare testing secret - ALWAYS use in dev
    : process.env.TURNSTILE_SECRET_KEY

  console.log('[TURNSTILE] Mode:', isDev ? 'DEVELOPMENT (testing key)' : 'PRODUCTION')
  console.log('[TURNSTILE] Using secret key:', effectiveSecretKey ? '***' + effectiveSecretKey.slice(-10) : 'NONE')

  // Fail securely in production if secret is not configured
  if (!effectiveSecretKey) {
    console.error('[TURNSTILE] CRITICAL: Secret key not configured in production!')
    return false
  }

  // If the token is empty
  if (!token) {
    console.error('[TURNSTILE] Token is empty')
    return false
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', effectiveSecretKey)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    console.log('[TURNSTILE] Sending verification request to Cloudflare...')

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }

    console.log('[TURNSTILE] Cloudflare response:', data)

    if (!data.success) {
      console.error('[TURNSTILE] Failed verification:', data)
    }

    return data.success === true
  } catch (error) {
    console.error('[TURNSTILE] Error verifying token:', error)
    return false
  }
}
