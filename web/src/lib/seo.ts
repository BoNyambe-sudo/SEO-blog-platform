export function getCanonicalUrl(path: string): string {
  const siteUrl = import.meta.env.SITE_URL?.replace(/\/$/, '') || ''
  return `${siteUrl}${path}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

export function getShareUrl(path: string): string {
  const siteUrl = import.meta.env.SITE_URL?.replace(/\/$/, '') || ''
  return `${siteUrl}${path}`
}
