/** Date formatting shared by blog views (en-GB, e.g. "19 Sept 2026"). */
export function formatDate(iso: string, style: 'short' | 'long' = 'short') {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', style === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' })
}
