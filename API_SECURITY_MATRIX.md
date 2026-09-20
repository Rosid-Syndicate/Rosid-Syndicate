# API_SECURITY_MATRIX.md

Inventory of every server endpoint and every externally reachable data access
path, with its security boundary. Update this file whenever a route or policy
changes.

## 1. Vercel serverless functions

Edge-level controls that apply to every row: Vercel Bot Protection (challenge),
AI-bot deny, OWASP CRS (log), **POST /api/* rate limit 12 / 60 s per IP → 429**,
Vercel Authentication on every `*.vercel.app` host.

| Endpoint | Method | Auth | Authorization | Bot control | Rate limit (app) | Cache | Max body | Idempotency | Risk |
|---|---|---|---|---|---|---|---|---|---|
| `/api/contact` | POST | none (public form) | same-site `Origin` allow-list; cross-site → 403 | honeypot · Turnstile siteverify (token required when secret set; **hostname must be ours**; single-use) | 5/h/IP · 15/d/IP · 5/d/sender | `no-store` | 32 kB | claim on sender+message, 10 min | HIGH (DB write + email) |
| `/api/tender` | POST | none | as above | as above + attachment allow-list (pdf/docx/xlsx, magic bytes, ≤ 2 MB) | 3/h/IP · 8/d/IP · 4/d/sender | `no-store` | ~3 MB | as above | HIGH |
| `/api/home-content` | GET/HEAD | none | anon key → RLS: published rows only | edge Bot Protection | edge cache absorbs load | `public, max-age=60, s-maxage=300, swr=1d`; `no-store` on 503 | — | n/a (read) | LOW |
| `/sitemap.xml` → `/api/sitemap` | GET | none | anon key → RLS | edge Bot Protection (verified crawlers exempt) | edge cache | `s-maxage=3600`, swr 1 d | — | n/a | LOW–MEDIUM |
| `/api/health` | GET/HEAD | none | anon key, reads one id | edge Bot Protection | daily Vercel Cron | `no-store` | — | n/a | LOW (liveness + Supabase keep-alive) |
| `/api/*` | OPTIONS | none | CORS preflight for allowed origins only | — | — | — | — | — | — |
| `/api/*` | other methods | — | — | — | — | — | — | — | 405 with `Allow` |

Input schemas: contact — `name` 2–120 · `company` ≤160 · `email` ≤254 ·
`phone` ≤40 `[0-9+()-. ]` · `inquiryType` ∈ 7 values · `message` 10–5000, ≤3
links · `honeypot` · `turnstileToken` ≤2048 · **no other keys**. Tender —
`companyName` 2–160 · `country` 2–80 · `contactPerson` 2–120 · `email` ·
`phone` · `tenderName` ≤200 · `tenderRef` ≤100 · `projectSector` ≤100 ·
`bidDeadline` YYYY-MM-DD · `requiredSupport` ∈ 8 values · `message` ≤5000 ·
`attachment {filename, content}` · **no other keys**.

Shared behaviour (`api/_lib/inquiry.js`): control order is method → origin →
size → honeypot → schema → rate limit → Turnstile → dedupe → persist → notify.
Only a stored **or** emailed lead returns 200; otherwise 503 (and the dedupe
claim is released). Structured logs never contain message bodies or raw emails.

## 2. Direct database access (Supabase PostgREST with the public anon key)

The browser talks to PostgREST directly for public reads. After
`20260919_admin_authorization.sql` and `20260919_admin_roles_content.sql`.
Staff roles: **admin** (everything) and **editor** (content tables only).
`is_staff()` = admin or editor; `is_admin()` = admin only.

| Table | anon | authenticated non-staff | editor (`is_staff()`) | admin (`is_admin()`) | Notes |
|---|---|---|---|---|---|
| `blog_posts` | SELECT where `is_published` | same | ALL | ALL | `views` only via RPC; body is Markdown, images https-only |
| `blog_categories` | SELECT | same | ALL | ALL | |
| `testimonials` | SELECT where `is_published` | same | ALL | ALL | home section renders only when ≥1 published |
| `faqs` | SELECT where `is_published` | same | ALL | ALL | seeded from the bundled list |
| `site_content` | SELECT | same | ALL | ALL | `mission` rendered on the home page (bundled fallback) |
| `companies` | SELECT where `is_archived = false` | same | — | ALL | public site currently reads bundled data instead |
| `credentials` | SELECT where `is_public` | same | — | ALL | |
| `inquiries` | INSERT with `status='New'` (until `20260919_inquiries_api_only.sql`) | same | — | ALL | no SELECT for anon → PII never readable publicly |
| `admin_users` (staff list) | — | — | — | ALL | trigger keeps ≥1 active admin |
| `storage.objects` (`credentials_files`) | SELECT/list only files linked to public credentials | same | — | ALL | bucket public → direct URL fetch bypasses RLS (documented) |
| `storage.objects` (`site-media`) | SELECT | same | INSERT/UPDATE/DELETE | same | public image bucket; 5 MB + image MIME types enforced by bucket config and client |
| RPC `increment_post_views(text)` | EXECUTE | EXECUTE | EXECUTE | EXECUTE | SECURITY DEFINER; +1 on published slug only |
| RPC `is_admin()` / `is_staff()` / `staff_role()` | EXECUTE | EXECUTE | EXECUTE | EXECUTE | role of the caller only, no data |
| RPC `link_admin_user()` | — | EXECUTE | EXECUTE | EXECUTE | links caller's auth id to the staff row with the same email; returns role |

Public pages read testimonials, FAQs and site content through plain PostgREST
fetches (`src/lib/publicData.ts`, anon key, ≤12 / ≤30 / ≤20 rows) so the
Supabase SDK is not shipped to visitors. Client query limits: blog index ≤200,
categories ≤100, related ≤3, credentials ≤200; admin lists ≤500. Column lists
are explicit (no `select('*')` on public pages except the single-post fetch).

## 3. Authentication endpoints (Supabase-hosted)

| Endpoint | Used by | Control |
|---|---|---|
| `POST /auth/v1/token?grant_type=password` | `/admin/login` | Supabase rate limits; generic UI error; Turnstile token forwarded when configured |
| `POST /auth/v1/recover` | "Forgot password?" on `/admin/login` | Supabase rate limits (default 1 email / 60 s per address); UI response identical for unknown addresses |
| `PUT /auth/v1/user` | `/admin/reset-password` (new password) | requires the recovery session from the emailed link; ≥10 characters enforced in UI |
| `GET /auth/v1/authorize?provider=google` | `/admin/login` only when `VITE_AUTH_GOOGLE_SIGNIN=true` | provider must be enabled in Supabase; role still comes from `admin_users` |
| `POST /auth/v1/signup` | **not used by the app** | must be disabled in the dashboard (finding C-1) |
| `POST /auth/v1/logout` | admin sign-out | — |

## 4. Static / rewrite surface

| Path | Behaviour |
|---|---|
| `/` | pre-rendered `index.html` (home) |
| known SPA routes (see `vercel.json`) | `app.html` shell |
| `/admin*` | `app.html` + `X-Robots-Tag: noindex` + `no-store` |
| anything else | HTTP 404 `public/404.html` |
| `/terms-and-conditions`, `/*.html` policy duplicates | 308 → canonical route |
| `/assets/*` | immutable, 1 year |

## 5. Rejected by design

Unexpected body keys · non-JSON bodies · oversized payloads · malformed emails
and dates · unknown enum values · executable/mismatched attachments · cross-site
browser origins · methods other than POST/OPTIONS on lead endpoints · path
segments in filenames · `javascript:` or unknown URL schemes in blog content.
