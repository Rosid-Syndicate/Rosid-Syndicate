/**
 * Image URL helpers.
 *
 * The site used 56 Unsplash URLs pinned to `w=3840&q=100` — 4K, maximum
 * quality, for cards rendered at ~300px. Measured on the live homepage this was
 * ~23 MB of image transfer. Unsplash serves through imgix, so we can request the
 * size we actually render and let `auto=format` negotiate AVIF/WebP.
 */

import type { SyntheticEvent } from 'react'

const UNSPLASH_HOST = 'images.unsplash.com'

/** Strip existing query params from an Unsplash URL and apply ours. */
export function unsplash(url: string, opts: { w: number; q?: number; h?: number } = { w: 1200 }): string {
  if (!url) return url
  try {
    const u = new URL(url, 'https://x')
    if (u.hostname !== UNSPLASH_HOST) return url
    const params = new URLSearchParams()
    params.set('auto', 'format')
    params.set('fit', 'crop')
    params.set('w', String(opts.w))
    if (opts.h) params.set('h', String(opts.h))
    params.set('q', String(opts.q ?? 70))
    return `${u.origin}${u.pathname}?${params.toString()}`
  } catch {
    return url
  }
}

/** srcset for a fluid image: returns e.g. "…w=640 640w, …w=1024 1024w" */
export function unsplashSrcSet(url: string, widths: number[] = [480, 768, 1024, 1440, 1920], q = 70): string | undefined {
  if (!url || !url.includes(UNSPLASH_HOST)) return undefined
  return widths.map((w) => `${unsplash(url, { w, q })} ${w}w`).join(', ')
}

/** Background-image CSS value at a sensible size for full-bleed sections. */
export function bgImage(url: string, w = 1920): string {
  return `url("${unsplash(url, { w, q: 65 })}")`
}

/**
 * `onError` handler for remote photos. Stock images get removed upstream from
 * time to time (four Unsplash ids used by this site vanished in 2026); rather
 * than a broken-image icon the element goes invisible and the container's brand
 * background shows through. Layout is preserved because the box is kept.
 */
export function hideBrokenImage(e: SyntheticEvent<HTMLImageElement>): void {
  hideImageElement(e.currentTarget)
}

export function hideImageElement(img: HTMLImageElement): void {
  img.removeAttribute('srcset')
  img.style.visibility = 'hidden'
  img.setAttribute('data-broken', '')
}

/**
 * Images in pre-rendered markup can fail before React hydrates, so their
 * `error` event is never seen by `onError`. Called once after hydration.
 */
export function sweepBrokenImages(root: ParentNode = document): void {
  root.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) hideImageElement(img)
  })
}
