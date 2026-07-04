export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500"%3E%3Crect fill="%23e5e5e5" width="800" height="500"/%3E%3Crect x="40" y="40" width="720" height="420" fill="none" stroke="%23000" stroke-width="4"/%3E%3Ctext fill="%23212121" font-family="sans-serif" font-size="22" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eimage unavailable%3C/text%3E%3C/svg%3E'

export function resolveAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${base}/${path.replace(/^\//, '')}`
}

export function handleImageError(event) {
  if (event?.currentTarget?.src !== IMAGE_PLACEHOLDER) {
    event.currentTarget.src = IMAGE_PLACEHOLDER
  }
}
