import { useEffect } from 'react'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '../config/site'
import { organizationJsonLd, websiteJsonLd } from '../lib/jsonld'

/**
 * Per-route document head management for the SPA (no external dependency).
 *
 * Sets: <title>, meta description, robots, canonical, Open Graph, Twitter and
 * JSON-LD. Every page renders exactly one <Seo>. On unmount the defaults are
 * restored so a page that forgets <Seo> never inherits another page's tags —
 * the previous ad-hoc `document.title = …` calls leaked descriptions between
 * routes.
 *
 * Search engines render JavaScript for this site (verified: Lighthouse SEO
 * audits see the rendered DOM), so client-set tags are honoured for indexing.
 * Social crawlers (Facebook/LinkedIn/X) do NOT run JS — they read the static
 * tags in index.html, which therefore carry the site-wide defaults.
 */

export type Breadcrumb = { name: string; path: string }

export interface SeoProps {
  /** Page title without the brand suffix. Omit for the home page. */
  title?: string
  description?: string
  /** Route path, e.g. "/companies". Used for the canonical URL. */
  path: string
  image?: string
  type?: 'website' | 'article'
  /** Private / not-found pages. Never set on legitimate public pages. */
  noindex?: boolean
  breadcrumbs?: Breadcrumb[]
  article?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    section?: string
    tags?: string[]
  }
  /** Additional JSON-LD objects (FAQPage, Service …). Must describe real content. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_TITLE = 'Rosid Syndicates Group — Infrastructure, Finance & Trade in Nepal'

function upsertMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (content === null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (href === null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(objects: Record<string, unknown>[]) {
  document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((n) => n.remove())
  for (const obj of objects) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.dataset.seo = 'jsonld'
    s.text = JSON.stringify(obj)
    document.head.appendChild(s)
  }
}


function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: absoluteUrl(b.path),
    })),
  }
}

export default function Seo({ title, description, path, image, type = 'website', noindex = false, breadcrumbs, article, jsonLd }: SeoProps) {
  // Structured props are compared by value so the effect does not re-run (and
  // rewrite <head>) on every render when a parent passes fresh object literals.
  const structuredKey = JSON.stringify({ breadcrumbs, article, jsonLd })

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    const desc = description || SITE_DESCRIPTION
    const canonical = absoluteUrl(path)
    const img = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertLink('canonical', noindex ? null : canonical)

    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', 'en_US')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)

    if (type === 'article' && article) {
      upsertMeta('property', 'article:published_time', article.publishedTime ?? null)
      upsertMeta('property', 'article:modified_time', article.modifiedTime ?? null)
      upsertMeta('property', 'article:section', article.section ?? null)
      upsertMeta('property', 'article:author', article.author ?? null)
    } else {
      upsertMeta('property', 'article:published_time', null)
      upsertMeta('property', 'article:modified_time', null)
      upsertMeta('property', 'article:section', null)
      upsertMeta('property', 'article:author', null)
    }

    const ld: Record<string, unknown>[] = []
    if (!noindex) {
      if (path === '/') ld.push(organizationJsonLd(), websiteJsonLd())
      if (breadcrumbs && breadcrumbs.length > 1) ld.push(breadcrumbJsonLd(breadcrumbs))
      if (jsonLd) ld.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]))
    }
    setJsonLd(ld)

    return () => {
      document.title = DEFAULT_TITLE
      upsertMeta('name', 'description', SITE_DESCRIPTION)
      upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')
      upsertLink('canonical', SITE_URL + '/')
      setJsonLd([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- structured props are covered by structuredKey
  }, [title, description, path, image, type, noindex, structuredKey])

  return null
}
