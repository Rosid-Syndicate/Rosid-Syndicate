/**
 * Admin-managed public content for the home page, fetched from the site's own
 * edge-cached endpoint (`/api/home-content`) — one same-origin request, no
 * CORS preflight, no Supabase SDK on public pages, and the database is hit at
 * most once per cache TTL per region rather than once per visitor.
 *
 * Every caller must handle `null` (offline, 5xx) and keep the bundled content
 * so the pre-rendered page is never broken.
 */

export interface PublicTestimonial {
  id: string
  author_name: string
  author_role: string | null
  company: string | null
  quote: string
  photo_url: string | null
}

export interface PublicFaq {
  id: string
  question: string
  answer: string
}

export interface HomeContent {
  faqs: PublicFaq[]
  testimonials: PublicTestimonial[]
  mission: string | null
}

export async function fetchHomeContent(signal?: AbortSignal): Promise<HomeContent | null> {
  try {
    const res = await fetch('/api/home-content', { headers: { Accept: 'application/json' }, signal })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<HomeContent>
    return {
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
      mission: typeof data.mission === 'string' ? data.mission : null,
    }
  } catch {
    return null
  }
}
