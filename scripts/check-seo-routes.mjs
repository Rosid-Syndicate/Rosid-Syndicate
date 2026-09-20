#!/usr/bin/env node
// Consistency check between:
//   - React routes in src/App.tsx
//   - vercel.json rewrites (every SPA route must be rewritten to index.html,
//     otherwise Vercel returns a real 404 for it)
//   - the sitemap manifest in api/_lib/routes.js
//   - company / service slugs in src/data
// Fails the build if anything drifts.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { STATIC_ROUTES, COMPANY_SLUGS, SERVICE_SLUGS } from '../api/_lib/routes.js'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const errors = []

// 1. React routes
const app = read('src/App.tsx')
const reactRoutes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*')

// 2. vercel.json rewrites → pattern list
const vercel = JSON.parse(read('vercel.json'))
const rewriteSources = vercel.rewrites.map((r) => r.source)
const redirectSources = vercel.redirects.map((r) => r.source)
const toRegex = (src) => new RegExp('^' + src.replace(/\/:([a-zA-Z]+)\*/g, '(?:/[^/]+)*').replace(/:([a-zA-Z]+)/g, '[^/]+') + '$')
const rewriteMatchers = rewriteSources.map(toRegex)
const covered = (path) => path === '/' || rewriteMatchers.some((re) => re.test(path.replace(/:([a-zA-Z]+)/g, 'x'))) || redirectSources.includes(path)

for (const route of reactRoutes) {
  if (!covered(route)) errors.push(`React route "${route}" has no vercel.json rewrite/redirect → would return 404 on Vercel`)
}

// 3. sitemap manifest paths must be React routes
const reactStatic = new Set(reactRoutes.filter((r) => !r.includes(':')))
for (const { path } of STATIC_ROUTES) {
  if (!reactStatic.has(path)) errors.push(`Sitemap route "${path}" is not a React route`)
}
const indexablePublic = reactRoutes.filter((r) => !r.includes(':') && !r.startsWith('/admin') && r !== '/terms-and-conditions')
for (const r of indexablePublic) {
  const asCompany = r.startsWith('/companies/') && COMPANY_SLUGS.includes(r.slice('/companies/'.length))
  if (!asCompany && !STATIC_ROUTES.some((s) => s.path === r)) errors.push(`Public route "${r}" is missing from the sitemap manifest (api/_lib/routes.js)`)
}

// 4. data slugs
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '')
const companies = [...stripComments(read('src/data/companies.ts')).matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1])
const services = [...stripComments(read('src/data/services.ts')).matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1])
const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x))
if (!same(companies, COMPANY_SLUGS)) errors.push(`COMPANY_SLUGS ${JSON.stringify(COMPANY_SLUGS)} ≠ src/data/companies.ts ${JSON.stringify(companies)}`)
if (!same(services, SERVICE_SLUGS)) errors.push(`SERVICE_SLUGS ${JSON.stringify(SERVICE_SLUGS)} ≠ src/data/services.ts ${JSON.stringify(services)}`)

// 5. no hash-router links, 4K image URLs or raw HTML injection slipped back in
const root = fileURLToPath(new URL('..', import.meta.url))
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]))
const src = ['src/components', 'src/pages', 'src/data'].flatMap((dir) => walk(path.join(root, dir)))
for (const file of src) {
  const text = readFileSync(file, 'utf8')
  const rel = path.relative(root, file)
  if (/href="\/?#\//.test(text) || /to="\/#\//.test(text)) errors.push(`${rel}: hash-router style link (#/…) found`)
  if (/w=3840/.test(text)) errors.push(`${rel}: 4K image URL (w=3840) found — use unsplash() helper`)
  if (/dangerouslySetInnerHTML/.test(text)) errors.push(`${rel}: dangerouslySetInnerHTML found — use renderMarkdown()`)
}

if (errors.length) {
  console.error('SEO/route consistency check FAILED:\n - ' + errors.join('\n - '))
  process.exit(1)
}
console.log(`SEO/route consistency OK (${reactRoutes.length} routes, ${STATIC_ROUTES.length} sitemap entries, ${companies.length} companies, ${services.length} services)`)
