# WEBSITE_AUDIT.md — Rosid Syndicates Group

Audit of the corporate website and repository, with implementation status.
Target: `https://rosid-sydnicate-company.vercel.app/` · Source of truth: this
repository (branch `claude/rosid-sydnicate-audit-b544b0`, based on `8295f32`).
Date: 19 September 2026.

Confidence labels: **Verified** (reproduced from code, live responses or
measurement) · **Likely** · **Needs manual verification**. Status: **Fixed**,
**Fixed (migration — apply manually)**, **Open (manual/config)**, **Business
decision**, **Documented**.

---

## Executive Summary

**Overall health before this work: functional but fragile.** The site rendered
and looked polished at a glance, but a self-registered user could become a full
admin, every contact submission created two duplicate leads while bypassing all
anti-abuse controls, the footer's main links pointed at a hash-router URL scheme
the app does not use, the sitemap and canonical URLs pointed at a domain that
does not resolve, the homepage transferred ~23.5 MB of images, and the largest
contentful paint waited on a JavaScript animation.

**Five most critical issues (all addressed in code; two also need a manual
Supabase step):**

1. Authorization: `TO authenticated USING (true)` everywhere + public sign-ups enabled → anyone can read inquiry PII and edit content. *(Migration + dashboard toggle.)*
2. Lead forms: browser + API both inserted rows (duplicates) and the browser path skipped honeypot/Turnstile/validation; Turnstile itself was skippable by omitting the token.
3. SEO plumbing pointed at `rosid.com.np`, which does not resolve: sitemap invalid for the real host, dead `og:url`, no per-route metadata, soft-404 for every unknown URL, zero crawlable links in the header, 11 broken footer/section links.
4. Performance: 23.5 MB image transfer (56 hard-coded `w=3840&q=100` URLs), 470 kB logo at 56 px, 714 kB single JS chunk, LCP 3.1 s (throttled mobile) gated on a blur/opacity animation.
5. Security surface: no CSP or security headers, unescaped user input in admin emails, unvalidated attachments, stored-XSS path in blog rendering, 4 high-severity dependency CVEs.

| Area | Verdict before | Verdict after (this branch) |
|---|---|---|
| UI/UX | Visually loud, inconsistent (gradient text, glass cards, dead clicks, invisible admin titles) | Coherent token-based system; every card navigates; admin unified |
| Accessibility | Lighthouse 94; contrast and heading-order failures; hover-only menus; unlabeled admin inputs | Lighthouse 100, 0 failing audits; keyboard-operable disclosures; measured contrast |
| SEO | Lighthouse 100 but structurally broken (dead host, soft 404s, no per-page meta, button nav) | Per-route metadata/canonical/JSON-LD, dynamic sitemap on the real host, real 404s, crawlable nav |
| Performance | 23.5 MB, LCP 3107 ms (throttled) | ~0.5 MB first load, LCP 657 ms (same profile, local build), home pre-rendered |
| Security | Critical authz flaw, no headers, injectable emails, skippable bot check | Layered controls; CSP; 0 known vulns; authz migration ready |
| Code quality | 21 lint errors, no tests, dead files, misleading README | 0 lint errors, 17 API tests, route-drift guard, accurate docs |
| Conversion | Vague hero copy, CTAs to `/#contact` that never scrolled, unverifiable stats | Specific value proposition, working CTAs with focus management, factual proof |

---

## Architecture map (Verified)

The master specification assumed Next.js. **The repository is not Next.js**;
findings and fixes were adapted to the real stack.

| Layer | Detail |
|---|---|
| Framework | Vite 6.4 · React 18.3 · TypeScript 5.6 · React Router 7.18 (`BrowserRouter`) · Tailwind 3.4 · Node ≥ 20 · npm |
| Rendering | Client-side SPA. Now: home route pre-rendered at build (`scripts/prerender.mjs`) and hydrated; other routes client-rendered from `app.html`; route-level code splitting |
| Routing | 19 public routes, 10 admin routes (`src/App.tsx`). Vercel rewrites per route; unknown → 404 |
| Backend | Vercel Node functions `api/contact.js`, `api/tender.js`, `api/sitemap.js` + shared `api/_lib/` |
| Database | Supabase Postgres: `inquiries`, `companies`, `site_content`, `credentials`, `blog_posts`, `blog_categories`; storage bucket `credentials_files` |
| Auth | Supabase email/password; client `ProtectedRoute`; RLS is the authorization boundary |
| Third parties | Cloudflare Turnstile, Resend, GA4 (opt-in), Unsplash, Google Fonts |
| Absent | Payments, bookings, webhooks, cron, Redis (optional Upstash now supported), Cloudflare proxy, `.agents/`, `AGENTS.md`, tests (now added) |
| Deployment | Vercel, region `bom1`; `vercel.json` now carries headers, redirects, rewrites |

### Page inventory

| Route | Type | Indexable | Notes |
|---|---|---|---|
| `/` | home (pre-rendered) | yes | Organization, WebSite, FAQPage JSON-LD |
| `/companies`, `/companies/:slug` (5) | listing/detail | yes | Organization (subsidiary) + Breadcrumb |
| `/companies/appi-saipal-financial-solutions` | dedicated company page | yes | FinancialService JSON-LD |
| `/service/:slug` (7) | capability pages | yes | Service + Breadcrumb |
| `/infrastructure-tender-services`, `/procurement`, `/group-structure`, `/corporate-profile`, `/projects`, `/credentials`, `/tender-inquiry` | content/utility | yes | Breadcrumb |
| `/blog`, `/blog/category/:slug`, `/blog/:slug` | editorial (Supabase) | yes | BlogPosting + article OG on posts |
| `/privacy-policy`, `/terms-conditions`, `/cookie-policy` | legal | yes | `/terms-and-conditions` 308 → canonical |
| `/project/:slug` | case studies | data empty → 404 view; robots `Disallow` kept | |
| `/admin`, `/admin/*` (9) | private | **no** (`X-Robots-Tag`, meta, robots.txt) | auth + RLS |
| `*` | not found | no | HTTP 404 (`404.html`) or in-app NotFound |

---

## Severity Matrix

### Critical

▸ [Critical] Any authenticated user is an admin; public sign-up enabled
- Severity: Critical · Confidence: High (Verified)
- Location: `supabase/migrations/20260826_admin_tables.sql:65-112`, `20260825_blog_system.sql:47-66`; live `GET /auth/v1/settings` → `disable_signup:false`
- Evidence: all policies `FOR ALL TO authenticated USING (true)`; no role/allow-list in code
- Why it matters: full read of inquiry PII and write access to all public content by anyone who registers
- Fix: `20260919_admin_authorization.sql` (admin allow-list, `is_admin()` policies, grandfathering); disable sign-ups in dashboard
- Effort: M · Status: **Fixed (migration — apply manually)** + **Open (manual: disable sign-ups)**

▸ [Critical] Duplicate lead rows and control bypass on both forms
- Severity: Critical · Confidence: High (Verified)
- Location: `src/components/Contact.tsx:54-80` (old), `src/pages/TenderInquiry.tsx:108-133` (old)
- Evidence: direct `supabase.from('inquiries').insert` followed by `fetch('/api/…')` which inserts again; API response ignored
- Fix: `src/lib/leads.ts`; forms call only the API and surface real errors; DB CHECK constraints
- Effort: M · Status: **Fixed**

▸ [Critical] Turnstile skippable; secret defaulted to a test key
- Severity: Critical · Confidence: High (Verified) · Location: `api/contact.js:40-41` (old)
- Fix: `api/_lib/turnstile.js` enforced mode · Effort: S · Status: **Fixed** (+ **Open**: set `TURNSTILE_SECRET_KEY`)

▸ [Critical] Canonical/OG/sitemap host does not resolve
- Severity: Critical (indexing) · Confidence: High (Verified: `curl: (6) Could not resolve host: rosid.com.np`)
- Location: `index.html` og:url/JSON-LD, `public/robots.txt`, `public/sitemap.xml` (all 13 `<loc>`)
- Why it matters: sitemap rejected (URLs off-host), social previews link to a dead domain
- Fix: `VITE_SITE_URL` (default = live Vercel host) drives canonical, OG, JSON-LD, robots and a dynamic `/sitemap.xml`
- Effort: M · Status: **Fixed**

▸ [Critical] 11 broken navigation links live in the DOM
- Severity: Critical (navigation) · Confidence: High (Verified in DOM: `#/projects`, `/#/blog`, `/#/companies/rosid-trade` …)
- Location: `src/components/Footer.tsx`, `src/components/Projects.tsx:19`, `src/pages/BlogPost.tsx:406,412` (old)
- Evidence: hash-router URLs under `BrowserRouter` resolve to the home page; slugs `rosid-trade`, `rosid-international-inc`, `rosid-facility-management`, `kasthamandap-commerce-and-company`, `b-c-exim-company` do not exist in `src/data/companies.ts`
- Fix: `<Link>` to real routes; company links derived from the data file; `npm run check:seo` fails on `#/` links
- Effort: S · Status: **Fixed**

▸ [Critical] Stored XSS path in blog rendering — see SECURITY_AUDIT.md · Status: **Fixed**

### High

▸ [High] 23.5 MB image transfer on the homepage
- Severity: High · Confidence: High (Verified: `performance.getEntriesByType('resource')` on production → totalTransfer 23,523 kB, images 23,280 kB; single card image 5,680 kB rendered at 288×420)
- Location: 56 occurrences of `?q=100&w=3840` across `src/`
- Fix: `src/lib/images.ts` (`unsplash()`, `unsplashSrcSet()`), real `<img>` with `srcset`/`sizes`, lazy loading below the fold; brand assets regenerated (470 kB → 5–33 kB)
- Effort: M · Status: **Fixed** (first load now ~0.5 MB incl. uncompressed JS locally)

▸ [High] LCP 3.1 s gated on JS + blur/opacity animation
- Severity: High · Confidence: High (Verified: DevTools trace, mobile, Fast 4G, 4× CPU → LCP 3107 ms, render delay 3063 ms, LCP element = hero `<span>` animated from `opacity:0; filter:blur(10px)`)
- Fix: hero text renders immediately (transform-only motion), home pre-rendered to static HTML and hydrated, route code splitting (714 kB → 86 kB main chunk), Supabase client only under `/admin`, non-blocking fonts with reduced weights
- Effort: L · Status: **Fixed** — LCP 657 ms on the local build under the identical profile (Vercel adds compression; production numbers must be re-measured after deploy)

▸ [High] No security headers / CSP · **Fixed** (`vercel.json`)

▸ [High] Header navigation had zero crawlable links and hover-only dropdowns
- Confidence: High (Verified: 12 `<button>`, 1 `<a>` in `<header>`; dropdowns `invisible group-hover:visible`)
- Fix: `Navbar.tsx` rewritten — 25 anchors, disclosure buttons with `aria-expanded/controls`, Escape/outside-click/focus-out closing, arrow-down to first item
- Effort: M · Status: **Fixed**

▸ [High] No per-route title/description/canonical; stale meta leaked between routes
- Confidence: High (Verified: `/companies` served home title/description; `AppiSaipal.tsx` mutated the description tag and never restored it)
- Fix: `src/components/Seo.tsx` on every page with cleanup; BreadcrumbList, Service, Organization, BlogPosting, FAQPage where real content exists
- Effort: M · Status: **Fixed**

▸ [High] Soft 404 for every unknown URL
- Confidence: High (Verified: `/this-page-does-not-exist-xyz` → HTTP 200, 2976 B shell; catch-all `<Navigate to="/">`)
- Fix: explicit rewrites + `public/404.html` (real HTTP 404, verified locally), in-app `NotFound` (noindex) for unknown slugs
- Effort: S · Status: **Fixed**

▸ [High] "Discuss a project" CTAs (`Link to="/#contact"`, ×10) never scrolled to the form
- Confidence: High (Verified: React Router does not scroll to hashes after pushState; reproduced locally — now lands on `#contact` with focus moved)
- Fix: `ScrollManager.tsx` · Effort: S · Status: **Fixed**

▸ [High] Contrast failures: white on `#FD7B00` (2.62:1) for primary CTAs; `slate-500` body copy (4.32:1)
- Confidence: High (Verified: Lighthouse color-contrast 7 items; ratios computed)
- Fix: token set with measured pairs (DESIGN.md §5): accent buttons use `ink` text (6.1:1), `muted` body (6.9:1), `accent-text` for orange text on light (5.1:1)
- Effort: M · Status: **Fixed**

▸ [High] `prose` classes used without `@tailwindcss/typography`
- Confidence: High (Verified: `tailwind.config.js` `plugins: []`; article bodies rendered unstyled)
- Fix: `.prose-body` component styles · Effort: S · Status: **Fixed**

▸ [High] Admin pages `Credentials`, `Companies`, `Content` rendered white titles on a light background
- Confidence: High (Verified: `text-white` h1 inside `bg-[#F4F4F2]` layout)
- Fix: unified light admin theme · Effort: M · Status: **Fixed**

▸ [High] Admin mutations reported success on failure; `BlogEditor` discarded articles on save errors
- Confidence: High (Verified: `toast.success('Article created (local session)')` in catch block, then `navigate('/admin/blog')`)
- Fix: every mutation reports the Supabase result; editor keeps `published_at`; `Content` upserts
- Effort: M · Status: **Fixed**

▸ [High] Lint gate failing (21 errors) and 7 dependency vulnerabilities · **Fixed** (0/0)

### Medium

▸ [Medium] Blog view counter silently failed for anonymous readers · **Fixed** (RPC)

▸ [Medium] Duplicate content: `/terms-conditions` vs `/terms-and-conditions`; orphan `public/*.html` policy copies · **Fixed** (308 redirects, files removed)

▸ [Medium] `robots.txt` `Disallow: /project/` — legitimate (route has no data, always 404). **Documented/kept**; remove when `src/data/projects.ts` is populated

▸ [Medium] Public credentials "View" used async download + `window.open` (blocked as popup on Safari/mobile) and `alert()` · **Fixed** (direct public URL links; signed URLs in admin)

▸ [Medium] Particle canvas animation ran `requestAnimationFrame` O(n²) on every device and ignored reduced-motion · **Fixed** (removed; static dot grid)

▸ [Medium] `background-attachment: fixed` on five sections (unsupported on iOS, scroll repaint cost) · **Fixed**

▸ [Medium] Heading order (h4 in footer after h2; h3 in hero cards; two h1 on blog post/category pages) · **Fixed**

▸ [Medium] Six 4K images + 6 weights of two font families loaded eagerly; render-blocking font CSS · **Fixed** (Inter 400–800, Montserrat 700/800, non-blocking, metric-matched fallbacks)

▸ [Medium] Source maps shipped to production (3 MB) · **Fixed**

▸ [Medium] Hard-coded Supabase URL/anon key in three files · **Fixed** (env required; build fails fast)

▸ [Medium] Admin dashboard downloaded every inquiry row to compute four counts · **Fixed** (head-only counts)

▸ [Medium] Mobile: 16 interactive elements under 24 px, 18 text nodes under 11 px (Verified on production at 375 px) · **Fixed** (44 px targets, 12 px minimum for interactive text)

### Low

▸ [Low] Unused deps (`@headlessui/react`), dead files (`App.css`, `react.svg`, `vite.svg`), inaccurate README (shadcn, `company_settings`, `src/components/ui`), CONTRIBUTING for "Artagan" · **Fixed** (deps/files) · README/CONTRIBUTING **Fixed** in this branch

▸ [Low] Analytics: `trackEvent` defined but unused; `@ts-ignore`, `any` · **Fixed** (typed; `lead_submitted` / `lead_failed` events)

▸ [Low] Toast styling off-brand (`#171717`) · **Fixed**

### Opportunity

▸ [Opportunity] Wire `site_content` and `companies` tables to the public site — **Partly done**: the mission statement, FAQs and published testimonials on the home page now come from the database (bundled fallbacks keep the prerender network-independent). Company pages still use bundled data because the table lacks the services/images those pages need

▸ [Opportunity] Populate `src/data/projects.ts` with cleared case studies; `/projects` and the sitemap already handle them

▸ [Opportunity] Custom domain: set `VITE_SITE_URL` when `rosid.com.np` (or another domain) is live; consider 301s from the Vercel host

---

## Business / content decisions (changed in this branch — please confirm or restore)

These items were unverifiable claims. The master specification forbids
fabricated statistics, certifications and case studies, so they were replaced
with statements the site itself can substantiate. Each is a one-line revert if
evidence exists (ideally published on `/credentials`).

| Item | Before | Now | Where |
|---|---|---|---|
| Statistics band | "100+ Global Partners · 150+ Projects Delivered · 40+ Years Experience · 2000+ Expert Workforce" (no source) | "5 operating companies · 2 business divisions · Kathmandu head office · Domestic & foreign developers served" | `src/components/Stats.tsx` |
| Footer badges | "ISO 9001:2015", "Gov Verified" | removed | `src/components/Footer.tsx` |
| Home "Selected Works" and `/projects` "Verified Rosid Syndicates Projects" | four named projects with no data (`projects.ts` empty; robots.txt already called them placeholders) | four **sectors** linking to capability pages; case-study slot renders from `projects.ts` when populated | `src/data/sectors.ts`, `src/components/Projects.tsx`, `src/pages/Projects.tsx` |
| Appi Saipal "Verified Infrastructure Asset" badge | present | "Focus area" caption | `src/pages/AppiSaipal.tsx` |
| Hero copy | "Engineer the future. With absolute certainty." | "Infrastructure, finance and trade — executed in Nepal." + factual sub-headline | `src/components/Hero.tsx` |
| Legal pages | mention `rosid.com.np` in body text | **unchanged** (legal text) — contact blocks now show the live host | `src/pages/*Policy*.tsx` |

Also flagged, unchanged: the seeded blog "case study" post cites specific
project figures (86 MW, USD 140 M) — verify before it stays published.

---

## Before / after measurements

| Metric (home page) | Before (production) | After (this branch) |
|---|---|---|
| Total transfer, first load | 23,523 kB (20 requests) | ~494 kB (12 requests) on local emulator with **uncompressed** JS; ≈ 320 kB expected with Vercel compression |
| Image transfer | 23,280 kB | 182 kB |
| Eager JS | 714 kB + 142 kB (184 + 45 kB gzip) | 86 kB + 181 kB (26 + 60 kB gzip); Supabase 57 kB gzip only under `/admin` |
| CSS | 67 kB (11 kB gzip) | 51 kB (8.8 kB gzip) |
| LCP (mobile, Fast 4G, 4× CPU) | 3107 ms (render delay 3063 ms) | 657 ms (local build, same profile) |
| CLS | 0.00 | 0.04 (font swap; metric-matched fallbacks added after measurement) |
| Lighthouse A11y / BP / SEO (mobile) | 94 / 100 / 100 (2 failing audits) | 100 / 100 / 100 (0 failing) |
| Crawlable header links | 1 | 25 |
| Broken (hash-router / nonexistent) links | 11 | 0 (build guard) |
| Per-route `<title>`/canonical | no | yes, all routes |
| Unknown URL status | 200 (soft 404) | 404 |
| Security headers | HSTS only | HSTS, CSP, nosniff, DENY, Referrer, Permissions, COOP |
| `npm audit --omit=dev` | 7 vulns (4 high) | 0 |
| ESLint | 21 errors, 1 warning | 0 / 0 |
| Tests | none | 17 passing (`node --test`) |
| Fonts | 10 weights, render-blocking | 7 weights, non-blocking |

Production numbers for LCP/transfer must be re-measured after deployment; the
"after" performance figures come from the built output served by
`npm run serve`, which does not compress responses.

---

## Prioritized action plan

| Priority | Finding | Category | Impact | Ease | Severity | Status |
|---|---|---|---|---|---|---|
| P0 | Admin authorization allow-list + disable sign-ups | Security | 10 | 6 | Critical | Migration ready — **apply + toggle** |
| P0 | Single write path, Turnstile enforcement, validation, rate limits | Security/Forms | 10 | 7 | Critical | Fixed |
| P0 | Real-host canonical/OG/sitemap/robots | SEO | 9 | 8 | Critical | Fixed |
| P0 | Broken footer/nav/sidebar links | UX/SEO | 9 | 9 | Critical | Fixed |
| P0 | Blog XSS-safe renderer | Security | 9 | 8 | Critical | Fixed |
| P0 | Dependency CVEs | Security | 8 | 9 | High | Fixed |
| P1 | Image pipeline + prerender + code splitting | Performance | 9 | 6 | High | Fixed |
| P1 | Security headers / CSP | Security | 8 | 8 | High | Fixed |
| P1 | Accessible navigation, contrast tokens, heading order | Accessibility | 8 | 6 | High | Fixed |
| P1 | Per-route SEO + structured data + 404s | SEO | 8 | 7 | High | Fixed |
| P1 | Admin correctness (fake success, invisible titles) | Admin | 7 | 7 | High | Fixed |
| P1 | Set Vercel env: Turnstile secret, service-role key, Resend from-domain, Upstash | Config | 8 | 8 | High | **Open (manual)** |
| P2 | Close anon INSERT after service-role key | Security | 6 | 9 | Medium | Migration ready |
| P2 | Private credentials bucket + signed URLs | Security | 5 | 6 | Medium | Documented |
| P2 | Wire `site_content`/`companies` tables to public pages | Product | 5 | 5 | Medium | Mission/FAQs/testimonials done; companies pending |
| P3 | Publish cleared case studies; remove `/project/` disallow | Content/SEO | 5 | 7 | Opportunity | Business decision |
| P3 | Custom domain + `VITE_SITE_URL` | SEO | 6 | 9 | Opportunity | Business decision |

---

## International SEO and AI-search notes

- Audience: primarily English-speaking procurement/finance professionals and
  foreign contractors interested in **Nepal**. Content is single-language;
  no country sub-folders or `hreflang` were introduced — there is no evidence of
  localized demand or content, and duplicating pages per market would create
  thin content. Revisit only with market data and translated content.
- Entity clarity for search engines and AI systems: Organization (`@id`),
  WebSite, five subsidiary Organizations with `parentOrganization`, Service
  pages, FAQPage from real FAQ content, BlogPosting with authors/dates from
  the database, BreadcrumbList on every inner page. All facts already appear
  on the site; nothing is invented.

---

## Admin capabilities added after the audit

Staff roles (`admin` / `editor`) with a Users & roles page; TipTap WYSIWYG blog
editor storing Markdown, with cover-image and in-body image uploads to a
`site-media` bucket; Testimonials and FAQs managers that drive the home page;
accessible confirmation dialogs replacing `window.confirm`; inquiries CSV
export; role-aware dashboard and navigation. Requires
`supabase/migrations/20260919_admin_roles_content.sql`.

## Validation performed

`npm run check` (eslint · tsc -b · route/manifest/slug drift check · 17 node
tests) — pass. `npm run build` (typecheck · vite build · prerender) — pass.
Local Vercel emulator (`npm run serve`): 404/308/rewrite/header behaviour,
sitemap generation (30 URLs including 4 live posts), dry-run form submissions,
mobile menu, keyboard dropdowns, hash CTA scroll+focus, not-found views, admin
login, blog rendering from live data, CSP violations (none). Lighthouse and
DevTools traces as tabulated above.

Not verified: authenticated admin pages in a browser (no credentials were
used); production behaviour after deployment; Supabase migration application.
