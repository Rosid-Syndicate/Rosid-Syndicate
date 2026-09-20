/**
 * Read-only access to public rows (testimonials, FAQs, site content) from
 * public pages without loading the Supabase SDK (~57 kB gzip). Uses PostgREST
 * directly with the public anon key; RLS restricts results to published rows.
 * Every caller must handle `null` (network error, missing env) and fall back
 * to bundled content so the pre-rendered page is never broken.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export async function publicSelect<T>(table: string, query: string, signal?: AbortSignal): Promise<T[] | null> {
  if (!url || !key) return null
  try {
    const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal,
    })
    if (!res.ok) return null
    return (await res.json()) as T[]
  } catch {
    return null
  }
}

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

export const fetchTestimonials = (signal?: AbortSignal) =>
  publicSelect<PublicTestimonial>('testimonials', 'select=id,author_name,author_role,company,quote,photo_url&is_published=eq.true&order=sort_order.asc,created_at.asc&limit=12', signal)

export const fetchFaqs = (signal?: AbortSignal) =>
  publicSelect<PublicFaq>('faqs', 'select=id,question,answer&is_published=eq.true&order=sort_order.asc,created_at.asc&limit=30', signal)

export const fetchSiteContent = async (signal?: AbortSignal): Promise<Record<string, string> | null> => {
  const rows = await publicSelect<{ section_key: string; content: string }>('site_content', 'select=section_key,content&limit=20', signal)
  if (!rows) return null
  return Object.fromEntries(rows.map((r) => [r.section_key, r.content]))
}
