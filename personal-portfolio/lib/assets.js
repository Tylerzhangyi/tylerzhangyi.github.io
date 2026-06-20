export function resolveAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${base}/${path.replace(/^\//, '')}`
}
