/**
 * Validates a Cloudflare Turnstile token.
 * @param token The turnstile token sent from the client
 * @param ip Optional client IP for better validation
 * @returns boolean indicating success or failure
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // If no secret key is configured (e.g. dev without internet), bypass
  if (!secretKey) {
    console.warn('[TURNSTILE] No secret key configured, bypassing validation.')
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

    const data: any = await res.json()
    return data.success === true
  } catch (error) {
    console.error('[TURNSTILE] Error verifying token:', error)
    return false
  }
}
