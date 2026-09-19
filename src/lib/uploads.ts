import { supabase } from './supabase'

/**
 * Admin image uploads to the public `site-media` bucket (blog images,
 * testimonial photos). Client-side checks mirror the bucket configuration
 * (5 MB, image types); storage RLS only allows staff to write.
 */

export const MEDIA_BUCKET = 'site-media'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'

export function validateImage(file: File): string | null {
  const ext = ACCEPTED[file.type]
  if (!ext) return 'Only JPG, PNG, WebP and GIF images are accepted.'
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be 5 MB or smaller.'
  return null
}

/** Downscale large images in the browser before upload (keeps GIFs untouched). */
async function optimise(file: File, maxWidth = 1800): Promise<Blob> {
  if (file.type === 'image/gif') return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, maxWidth / bitmap.width)
  if (scale === 1 && file.type !== 'image/png') return file
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82))
  return blob && blob.size < file.size ? blob : file
}

/**
 * Uploads an image and returns its public URL.
 * @param folder  logical folder inside the bucket, e.g. "blog" or "testimonials"
 */
export async function uploadImage(file: File, folder: 'blog' | 'testimonials'): Promise<string> {
  const problem = validateImage(file)
  if (problem) throw new Error(problem)

  const blob = await optimise(file)
  const contentType = blob.type || file.type
  const ext = contentType === 'image/webp' ? 'webp' : ACCEPTED[contentType] || ACCEPTED[file.type]
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
