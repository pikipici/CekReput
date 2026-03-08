/**
 * Validates a Cloudflare Turnstile token.
 * @param token The turnstile token sent from the client
 * @param ip Optional client IP for better validation
 * @returns boolean indicating success or failure
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const isDev = process.env.NODE_ENV !== 'production'
  
  // If we are in development mode, the frontend is likely using the testing sitekey ('1x00000000000000000000AA').
  // Therefore, we MUST use the corresponding testing secret key here to pass Cloudflare's validation.
  const secretKey = isDev 
    ? '1x0000000000000000000000000000000AA' 
    : process.env.TURNSTILE_SECRET_KEY

  // Fail securely in production if secret is not configured
  if (!secretKey) {
    if (!isDev) {
      console.error('[TURNSTILE] CRITICAL: Secret key not configured in production!')
      return false
    }
    // Only bypass in non-production environments for development convenience
    console.warn('[TURNSTILE] No secret key configured, bypassing validation (development only).')
    return true
  }

  // If the token is empty
  if (!token) return false

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }
    
    if (!data.success) {
      console.error('[TURNSTILE] Failed verification:', data)
    }
    
    return data.success === true
  } catch (error) {
    console.error('[TURNSTILE] Error verifying token:', error)
    return false
  }
}
