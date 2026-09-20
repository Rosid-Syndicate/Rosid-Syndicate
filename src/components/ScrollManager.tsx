import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores sensible scroll behaviour for client-side navigation:
 *  - new pathname → scroll to top (pages previously did this ad hoc, some didn't)
 *  - URL hash (e.g. /#contact from a subpage CTA) → scroll to the element once it
 *    exists. Before this, every "Discuss a project" CTA that pointed at /#contact
 *    landed on the top of the home page because React Router does not scroll to
 *    hashes after pushState navigation.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      let attempts = 0
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
          // Move focus for keyboard/screen-reader users without scrolling again.
          if (el instanceof HTMLElement) {
            const hadTabIndex = el.hasAttribute('tabindex')
            if (!hadTabIndex) el.setAttribute('tabindex', '-1')
            el.focus({ preventScroll: true })
            if (!hadTabIndex) el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true })
          }
          return
        }
        if (attempts++ < 20) window.setTimeout(tryScroll, 50)
      }
      tryScroll()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
