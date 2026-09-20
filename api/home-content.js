// GET /api/home-content
//
// The admin-managed pieces of the home page (FAQs, published testimonials,
// mission statement) in one response, cached at the Vercel edge. Replaces
// three browser→Supabase requests (plus three CORS preflights) per visit with
// a single same-origin request that reaches the database at most once per
// TTL per region. Reads use the anon client, so RLS — not this code — decides
// what is public. Errors are never cached; the client falls back to bundled
// content.

import { securityHeaders } from './_lib/http.js'
import { publicSupabase } from './_lib/supabase.js'

const TTL_SECONDS = 300 // freshness for edits made in the admin
const SWR_SECONDS = 86400 // serve stale while refreshing in the background

export default async function handler(req, res) {
  securityHeaders(res)
  res.setHeader('X-Robots-Tag', 'noindex')
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const db = publicSupabase()
  if (!db) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'Content service unavailable' })
  }

  const [faqs, testimonials, content] = await Promise.all([
    db.from('faqs').select('id, question, answer').eq('is_published', true).order('sort_order').order('created_at').limit(30),
    db
      .from('testimonials')
      .select('id, author_name, author_role, company, quote, photo_url')
      .eq('is_published', true)
      .order('sort_order')
      .order('created_at')
      .limit(12),
    db.from('site_content').select('section_key, content').limit(20),
  ])

  const failed = [faqs, testimonials, content].find((r) => r.error)
  if (failed) {
    res.setHeader('Cache-Control', 'no-store')
    console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'home_content.db_error', message: failed.error.message }))
    return res.status(503).json({ error: 'Content service unavailable' })
  }

  const mission = (content.data || []).find((r) => r.section_key === 'mission')?.content ?? null

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', `public, max-age=60, s-maxage=${TTL_SECONDS}, stale-while-revalidate=${SWR_SECONDS}`)
  return res.status(200).json({
    faqs: faqs.data || [],
    testimonials: testimonials.data || [],
    mission,
  })
}
