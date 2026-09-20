// Single source of truth for public site identity used by SEO, structured
// data and the footer/contact blocks. Every value here is already published on
// the site or in the repository — nothing is invented.

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.rosiddai.com').replace(/\/$/, '')

/** Host without scheme, for display (e.g. in policy contact blocks). */
export const SITE_HOST = new URL(SITE_URL).host

export const SITE_NAME = 'Rosid Syndicates Group'

export const SITE_DESCRIPTION =
  'Rosid Syndicates Group is a Kathmandu-based group of five companies providing construction supply, public tender execution, bank guarantee and financial-closure advisory, and cross-border trade and logistics in Nepal — for domestic developers and foreign contractors.'

export const DEFAULT_OG_IMAGE = `${SITE_URL}/preview.png`

export const CONTACT = {
  phone: '+977-9705398939',
  phoneHref: 'tel:+9779705398939',
  email: 'rosidgroup@outlook.com',
  addressLocality: 'New Baneshwor, Kathmandu',
  addressCountry: 'NP',
  addressLine: 'New Baneshwor, Kathmandu, Nepal',
}

export type SocialPlatform = 'facebook' | 'instagram' | 'x' | 'youtube' | 'linkedin'

/**
 * Official profile URLs. Leave a platform empty and its icon is simply not
 * rendered (footer) and not listed in the Organization `sameAs` structured
 * data — never a dead or invented link.
 */
export const SOCIAL_PROFILES: Record<SocialPlatform, string> = {
  facebook: '#',
  instagram: '#',
  x: '#',
  youtube: '#',
  linkedin: '#',
}

export const SOCIAL_URLS = Object.values(SOCIAL_PROFILES).filter(Boolean)

export const SUBSIDIARY_COUNT = 5

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
