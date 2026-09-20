// Google Analytics 4 — loaded only when VITE_GA_MEASUREMENT_ID is configured.
// No script is injected and no request is made otherwise.

type GtagArgs = unknown[]

declare global {
  interface Window {
    dataLayer: GtagArgs[]
    gtag: (...args: GtagArgs) => void
  }
}

export const GA_MEASUREMENT_ID: string = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

export const initAnalytics = () => {
  if (!GA_MEASUREMENT_ID) return
  if (document.getElementById('ga-script')) return

  const script = document.createElement('script')
  script.id = 'ga-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: GtagArgs) => {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  // IP anonymisation is default in GA4; send_page_view is handled by trackPageView.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true })
}

export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title })
}

/** Business events: lead_submitted, lead_failed, cta_click … (no PII). */
export const trackEvent = (eventName: string, params?: Record<string, string | number | boolean | undefined>) => {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}
