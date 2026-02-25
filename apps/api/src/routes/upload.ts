import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import type { JwtPayload } from '../middleware/auth.js'

const upload = new Hono()

/**
 * POST /api/upload/evidence
 * Upload evidence files for a report.
 * In production, this uploads to S3/Supabase Storage.
 * For now, returns a mock URL.
 */
upload.post('/evidence', authMiddleware, async (c) => {
  const user = c.get('user') as JwtPayload
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'File wajib diunggah' }, 400)
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return c.json({
      error: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.',
    }, 400)
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return c.json({ error: 'Ukuran file maksimal 5MB' }, 400)
  }

  // In production: upload to Supabase Storage / S3
  // For now: generate a mock URL
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const fileUrl = `/uploads/evidence/${fileName}`

  return c.json({
    message: 'File berhasil diunggah',
    file: {
      url: fileUrl,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  }, 201)
})

export default upload
