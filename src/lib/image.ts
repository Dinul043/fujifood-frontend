/**
 * Image URL helper — resolves uploaded images to full backend URL.
 * 
 * Uploaded images are stored as /uploads/filename.png on the backend.
 * This helper prepends the backend host when needed.
 */

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')

export function resolveImageUrl(url: string | null | undefined, fallbackId?: number): string {
  if (!url) return `/images/food/dish-${((fallbackId || 1) % 10) + 1}.png`
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`
  // Handle case where only filename is stored (legacy data)
  if (url.match(/^[a-f0-9]+\.\w+$/)) return `${BACKEND_URL}/uploads/${url}`
  return url
}
