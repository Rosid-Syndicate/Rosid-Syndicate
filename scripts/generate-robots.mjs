#!/usr/bin/env node
// Writes public/robots.txt with the sitemap URL for the configured site origin.
// Runs as `prebuild`. The sitemap itself is generated on request by
// api/sitemap.js (rewritten from /sitemap.xml in vercel.json).

import { writeFileSync } from 'node:fs'

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://www.rosiddai.com').replace(/\/$/, '')

const robots = `# ${siteUrl}
User-agent: *
Allow: /

# Private application areas (also protected by authentication and X-Robots-Tag)
Disallow: /admin
Disallow: /admin/
Disallow: /api/

# Case-study routes have no published data yet; re-enable when src/data/projects.ts is populated
Disallow: /project/

# Block AI crawlers and scrapers
User-agent: ClaudeBot
Disallow: /
User-agent: Claude-Web
Disallow: /
User-agent: GPTBot
Disallow: /
User-agent: ChatGPT-User
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: PerplexityBot
Disallow: /
User-agent: Omgili
Disallow: /
User-agent: OmgiliBot
Disallow: /
User-agent: Diffbot
Disallow: /
User-agent: Bytespider
Disallow: /
User-agent: ImagesiftBot
Disallow: /
User-agent: cohere-ai
Disallow: /

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(new URL('../public/robots.txt', import.meta.url), robots)
console.log(`robots.txt written for ${siteUrl}`)
