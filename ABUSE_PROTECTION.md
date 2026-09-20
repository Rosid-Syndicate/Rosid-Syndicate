# Abuse Protection

Evidence-based bot and abuse controls for `www.rosiddai.com`. Layers, from the
edge inward: Vercel Firewall → application pipeline (`api/_lib/inquiry.js`) →
Cloudflare Turnstile siteverify → Supabase RLS. No single layer is trusted on
its own; nothing here claims to stop every bot.

## 1. Traffic classification (owner-supplied Vercel Firewall snapshot, past day)

The snapshot has no per-path or per-status breakdown, so classification uses
IP ownership, User-Agent, host and what the team was doing at the time.

| Source | Requests | Host | UA / signal | Classification | Action |
|---|---|---|---|---|---|
| 103.106.200.58 | 447 | www | Chrome Windows, Claude/2.x, HeadlessChrome | **Owner's PC** (this session: manual browsing, Claude desktop browser, headless QA) | none |
| 103.161.223.15 | 155 | www | Chrome / Android | Nepali consumer ISP; consistent with the owner's phone/second device | none |
| 13.57.x, 54.183.x, 18.144.x, 54.215.x, 54.241.x, 52.53.x | ~110 | www, previews | `vercel-fetch`, HeadlessChrome | **Vercel internal** (AWS us-west-1: deployment checks, screenshots, Speed Insights) | none |
| 192.178.4.x, 192.178.8.x, 66.249.84.130 | ~45 | www | Googlebot, Googlebot-Image, Google-Site-Verification | **Verified Google crawlers** (Search Console verification happened this week) | allow, never challenge |
| 40.77.167.x, 157.55.39.x, 52.167.144.234 | ~8 | www | Bingbot | **Verified Bing crawler** | allow |
| 34.123.170.104, 44.x | ~30 | www | HeadlessChrome | Google Cloud / AWS automation — most likely PageSpeed/Lighthouse runs from this session | none; watch |
| 82.26.161.x, 202.51.88.220, 49.42.x, 210.212.210.87 | ~60 | www | Chrome, Edge, HeyTapBrowser, iPhone | Ordinary visitors (UK/Nepal/India ranges) | none |
| Hosts `rosid-sydnicate.vercel.app` (63), previews (~12 each) | ~110 | aliases | mixed | Owner/Vercel traffic to alias and preview URLs — all now behind Vercel Authentication; `rosid-sydnicate.vercel.app` currently returns `DEPLOYMENT_NOT_FOUND` | see §3 |

JA4: the top fingerprints (`t13d1516h2_8daaf6152771_*`) are stock Chrome on
Windows/Android — they match the owner's devices and ordinary visitors, not a
tool. No fingerprint shows an abusive sequence, so **no JA4 rule** was created.

Verdict: no abusive actor is present in the sample. The 360 "challenged" and
20 "denied" entries are Bot Protection acting on non-browser clients (curl and
headless QA from this session) and one burst test. Rules were therefore kept
to the minimum that protects the only expensive, writable surface.

## 2. Rules in force

| Layer | Rule | Match | Action | Reason | SEO safe? | False-positive risk |
|---|---|---|---|---|---|---|
| Vercel Firewall (managed) | Bot Protection | non-browser / automation signals | challenge | platform default; verified crawlers exempt | yes | low; blocks scripted QA (use a browser or bypass token) |
| Vercel Firewall (managed) | AI Bots | known AI crawlers | deny | **owner decision (19 Sep 16:41)** — kept; trade-off: no AI-search/GEO visibility | n/a | none for search engines |
| Vercel Firewall (custom) | Lead API flood guard | `path` starts with `/api/` AND `method = POST` | rate limit 12 / 60 s per IP → **429** | stops floods before function invocation and siteverify; humans post ≤ 2 forms | yes (crawlers never POST) | very low |
| Vercel OWASP CRS | gen / rce / xss / sqli | request patterns | **log** only | visibility without blocking; enable "deny" per rule after reviewing logs | yes | n/a in log mode |
| Vercel platform | System mitigation | bursts (observed: 11 rapid POSTs) | deny 403 (`x-vercel-mitigated: deny`) | platform default | yes | low |
| Vercel Deployment Protection | Vercel Authentication | every `*.vercel.app` URL | login required | previews/aliases never public or indexable | yes (custom domain public) | none |
| App (`inquiry.js`) | Origin check | `Origin` not in allow-list / not a preview | 403 | CSRF / hot-linked form abuse | n/a | none (server-to-server allowed through, still Turnstile + limits) |
| App | Honeypot | hidden field filled | fake 200, no work | cheap bot filter | n/a | none |
| App | Unexpected keys / body > limit | mass-assignment, oversized | 400 / 413 | | n/a | none |
| App | Rate limits | contact 5/h/IP, 15/d/IP, 5/d/email · tender 3/h, 8/d, 4/d | 429 + `Retry-After` | per-endpoint cost | n/a | low; burst then throttle, never a ban |
| App | Turnstile siteverify | missing/invalid/replayed/foreign-host token | 403 | proves a human on **our** hostname | n/a | none for real users |
| App | Duplicate claim | same email+message within 10 min | idempotent 200 | double-click / retry safety | n/a | none |
| Supabase | RLS + roles | every table, storage | deny by default | data boundary | n/a | none |
| Supabase | Auth | sign-ups off; built-in auth rate limits; optional CAPTCHA (`supabase/config.toml`) | | credential stuffing / enumeration | n/a | none |

Not created (insufficient evidence or unacceptable risk): IP bans, country
blocks, JA4 rules, site-wide challenges, challenges on `/admin/*` (sign-in
traffic goes browser → Supabase, not through Vercel; Supabase's own limits and
optional CAPTCHA apply there).

## 3. Hosts

| Host | Status | Handling |
|---|---|---|
| `www.rosiddai.com` | canonical | public, cached, crawlable |
| `rosiddai.com` | alias | 308 → www (Vercel domain redirect) |
| `rosid-sydnicate-rosidsyndicate.vercel.app`, `…-git-main-…`, previews | Vercel URLs | Vercel Authentication (302 → SSO); `X-Robots-Tag: noindex` at the edge as well |
| `rosid-sydnicate.vercel.app` (63 hits in snapshot) | `DEPLOYMENT_NOT_FOUND` | not an active alias; nothing served — monitor, no redirect |
| `rosid-sydnicate-company.vercel.app` (previous project) | `DEPLOYMENT_NOT_FOUND` | gone; still an allowed *Origin* for the API for cached pages, harmless |
| `rosid.com.np` (registered in the team) | no DNS | unused; attach and redirect if the business wants it |

## 4. Endpoint cost tiers

| Tier | Endpoints | Controls |
|---|---|---|
| LOW | HTML, `/assets`, `/brand`, `/img`, `/robots.txt`, `/api/home-content` (edge-cached) | cache, allow crawlers |
| MEDIUM | `/sitemap.xml` (1 h edge cache, anon DB read), public blog reads (direct Supabase, RLS, explicit columns, bounded) | cache, limits |
| HIGH | `POST /api/contact`, `POST /api/tender` (DB write + email + siteverify + attachment scan) | edge rate limit, app rate limits, Turnstile, honeypot, dedupe, validation, 413 |
| CRITICAL | Supabase Auth, admin mutations | sign-ups off, RLS roles, last-admin trigger, optional CAPTCHA, no caching, noindex |

## 5. Development traffic

Claude/Antigravity/headless QA from the owner's network is challenged by Bot
Protection (expected). For scripted checks against production use a real
browser, or create a Protection Bypass token in Vercel and send it as the
`x-vercel-protection-bypass` header — never disable Bot Protection globally.

## 6. Monitoring

Watch in Vercel → Firewall: challenge/deny counts per path, 429s from the
flood-guard rule, and 4xx/5xx on `/api/*`. Application logs are structured
JSON (`securityLog`) with hashed emails and no message bodies. Review the
OWASP CRS log entries monthly before switching any category to "deny".
