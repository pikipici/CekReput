/**
 * Data masking utilities for privacy compliance (UU PDP).
 * Masks sensitive data in API responses based on user role.
 */

/** Mask account number: "1234567890" → "123xxxx890" */
export function maskAccountNumber(value: string | null): string {
  if (!value) return ''
  if (value.length <= 6) return value.slice(0, 2) + 'x'.repeat(value.length - 2)
  const start = value.slice(0, 3)
  const end = value.slice(-3)
  const middle = 'x'.repeat(Math.max(value.length - 6, 4))
  return `${start}${middle}${end}`
}

/** Mask phone number: "081234567890" → "0812-xxxx-7890" */
export function maskPhoneNumber(value: string | null): string {
  if (!value) return ''
  const clean = value.replace(/\D/g, '')
  if (clean.length < 8) return clean.slice(0, 2) + 'x'.repeat(clean.length - 2)
  const start = clean.slice(0, 4)
  const end = clean.slice(-4)
  return `${start}-xxxx-${end}`
}

/** Mask entity name: "Anton Suryo" → "A***n S***o" */
export function maskEntityName(value: string | null): string {
  if (!value) return ''
  return value
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word[0] + '*'
      return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1]
    })
    .join(' ')
}

/** Normalize phone number for search: remove +62, leading 0, spaces, dashes */
export function normalizePhoneNumber(value: string): string {
  let clean = value.replace(/[\s\-\(\)\.]/g, '')
  if (clean.startsWith('+62')) clean = '0' + clean.slice(3)
  if (clean.startsWith('62')) clean = '0' + clean.slice(2)
  return clean
}

/** Detect input type based on pattern */
export function detectInputType(query: string): 'phone' | 'account' | 'name' {
  const clean = query.replace(/[\s\-\(\)\.]/g, '')
  // Phone: starts with 0, +62, or 62 and is 10-15 digits
  if (/^(\+?62|0)\d{8,13}$/.test(clean)) return 'phone'
  // Account: purely numeric or alphanumeric with mostly digits (> 7 chars)
  if (/^\d{7,}$/.test(clean)) return 'account'
  // Default: name search
  return 'name'
}
