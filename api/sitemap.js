// GET /sitemap.xml  (rewritten to /api/sitemap in vercel.json)
//
// Generates the sitemap from the public route manifest plus published blog
// posts and categories in Supabase, so posts added through the admin are
// discoverable without a redeploy. Cached at the edge for an hour.

import { BLOG_CATEGORY_SLUGS, COMPANY_SLUGS, SERVICE_SLUGS, STATIC_ROUTES, siteUrl } from './_lib/routes.js'
import { publicSupabase } from './_lib/supabase.js'

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function url(loc, { lastmod, changefreq, priority } = {}) {
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${esc(lastmod)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority !== undefined ? `    <priority>${priority.toFixed(1)}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

export default async function handler(req, res) {
  const base = siteUrl()
  const entries = []

  for (const r of STATIC_ROUTES) entries.push(url(`${base}${r.path}`, r))
  for (const slug of COMPANY_SLUGS) entries.push(url(`${base}/companies/${slug}`, { changefreq: 'monthly', priority: 0.8 }))
  for (const slug of SERVICE_SLUGS) entries.push(url(`${base}/service/${slug}`, { changefreq: 'monthly', priority: 0.7 }))

  let categories = BLOG_CATEGORY_SLUGS
  const supabase = publicSupabase()
  if (supabase) {
    try {
      const [{ data: posts }, { data: cats }] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('slug, updated_at, published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(1000),
        supabase.from('blog_categories').select('slug').limit(200),
      ])
      if (Array.isArray(cats) && cats.length) categories = cats.map((c) => c.slug)
      for (const p of posts || []) {
        if (!p.slug || !/^[a-z0-9-]+$/i.test(p.slug)) continue
        const lastmod = (p.updated_at || p.published_at || '').slice(0, 10) || undefined
        entries.push(url(`${base}/blog/${p.slug}`, { lastmod, changefreq: 'monthly', priority: 0.7 }))
      }
    } catch (err) {
      console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'sitemap.supabase_error', error: String(err?.message || err) }))
    }
  }
  for (const slug of categories) {
    if (/^[a-z0-9-]+$/i.test(slug)) entries.push(url(`${base}/blog/category/${slug}`, { changefreq: 'weekly', priority: 0.5 }))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  return res.status(200).send(xml)
}
