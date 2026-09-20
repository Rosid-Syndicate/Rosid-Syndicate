// GET /api/health
//
// Liveness check that also keeps the Supabase project active: free-tier
// projects are paused after seven days without any request, which would take
// the blog, forms and admin down with it. Vercel Cron calls this once a day
// (see "crons" in vercel.json); the query is the cheapest possible read via
// the anon key and returns no data. Never cached, reveals nothing sensitive.

import { securityHeaders } from './_lib/http.js'
import { publicSupabase } from './_lib/supabase.js'

export default async function handler(req, res) {
  securityHeaders(res)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const started = Date.now()
  const db = publicSupabase()
  if (!db) return res.status(503).json({ status: 'degraded', database: 'unconfigured' })

  const { error } = await db.from('faqs').select('id').limit(1)
  const ms = Date.now() - started
  if (error) {
    console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'health.db_error', message: error.message, ms }))
    return res.status(503).json({ status: 'degraded', database: 'error', ms })
  }
  return res.status(200).json({ status: 'ok', database: 'ok', ms })
}
