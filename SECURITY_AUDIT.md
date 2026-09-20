# SECURITY_AUDIT.md — Rosid Syndicates Group website

Defensive security audit of the repository and the production deployment
(`https://rosid-sydnicate-company.vercel.app`), performed 19 September 2026 on
branch `claude/rosid-sydnicate-audit-b544b0`.

Legend — **Verified**: reproduced from source, live response or measurement.
**Likely**: strong evidence, not directly reproduced. **Needs manual
verification**: cannot be checked from the repository or public responses.
Status — **Fixed (code)**, **Fixed (migration, apply manually)**, **Mitigated**,
**Open (manual action)**, **Documented**.

No production data was read beyond public endpoints, and none was modified.
Secret values were never printed.

---


> **Status update — 20 September 2026.** Production now runs on
> `https://www.rosiddai.com` against Supabase project `yemiingdtfelkfcagins`
> (the project audited below, `mlfakixbqzgttwzqinvl`, no longer exists). All
> migrations, sign-up disablement and auth URLs are applied; Vercel Deployment
> Protection keeps every `*.vercel.app` host private; a scoped edge rate limit
> guards `POST /api/*`; Turnstile tokens are bound to our hostname on the
> server. Remaining items are listed in SECURITY_HARDENING.md §10–§11 and
> ABUSE_PROTECTION.md. See SECURITY_ARCHITECTURE.md for the layer model.

## 1. Scope and architecture

| Layer | Finding |
|---|---|
| Frontend | Vite 6 + React 18 SPA, React Router 7, Tailwind 3. Single `index.html` served for every route via Vercel rewrite. |
| Backend | Two Vercel Node functions: `POST /api/contact`, `POST /api/tender`. No other server code. |
| Data | Supabase Postgres (`inquiries`, `companies`, `site_content`, `credentials`, `blog_posts`, `blog_categories`), Storage bucket `credentials_files` (public). |
| Auth | Supabase email/password. Client-only `ProtectedRoute`; authorization enforced solely by RLS. |
| Third parties | Cloudflare Turnstile (widget), Resend (email), Google Analytics (optional), Unsplash (images), Google Fonts. |
| Not present | Payments, webhooks, cron, Redis, Cloudflare proxy/WAF, middleware, SSR. |

## 2. Threat model

| Actor | Goal | Relevant surface |
|---|---|---|
| Anonymous internet user / bot | Spam or exhaust the lead forms; enumerate data through the public Supabase API; phish the admin via injected email content | `/api/contact`, `/api/tender`, PostgREST with anon key, admin inbox |
| Self-registered Supabase user | Escalate to admin: read inquiry PII, alter public content, upload files | Supabase Auth sign-up + RLS |
| Compromised or malicious admin | Stored XSS on public pages via blog content | Blog editor → `BlogPost` renderer |
| Passive attacker / crawler | Learn internal structure, index private pages | Missing security headers, `/admin/*` indexable |
| Supply chain | Known CVEs in dependencies | `react-router` 7.15.0, `postcss` |

---

## 3. Findings

### ▸ [Critical] Any authenticated Supabase user is a full admin, and public sign-up is enabled
- Severity: Critical · Confidence: High (**Verified**)
- Location: `supabase/migrations/20260826_admin_tables.sql` lines 65–112, `20260825_blog_system.sql` lines 47–66; Supabase project settings.
- Evidence: every policy is `FOR ALL TO authenticated USING (true) WITH CHECK (true)`. Live `GET /auth/v1/settings` returned `disable_signup: false`, `external.email: true`. There is no admin role, claim or allow-list anywhere in the codebase.
- Why it matters: anyone can call `supabase.auth.signUp` with the public anon key, confirm their email and immediately read all inquiries (names, emails, phones, tender details), edit/delete blog posts and companies, publish/unpublish credentials and upload files to the public bucket.
- Fix: `supabase/migrations/20260919_admin_authorization.sql` introduces `public.admin_users` + `is_admin()` and rewrites every authenticated policy to require it; existing users are grandfathered so the current admin is not locked out. **And** disable "Allow new users to sign up" in the Supabase dashboard (defence in depth; removes the entry point entirely).
- Status: **Fixed (migration, apply manually)** + **Open (manual action: disable sign-ups)**.

### ▸ [Critical] Lead forms wrote to the database twice and bypassed every server-side control
- Severity: Critical (data integrity + abuse) · Confidence: High (**Verified**)
- Location: `src/components/Contact.tsx` (old lines 54–80), `src/pages/TenderInquiry.tsx` (old lines 108–133), `api/contact.js`, `api/tender.js`.
- Evidence: the browser inserted directly into `inquiries` with the anon key, then called the API which inserted again → two rows per submission. The direct path had no honeypot, Turnstile, rate limit or validation.
- Fix: browser now only calls the API (`src/lib/leads.ts`); the API is the single write path. `20260919_inquiries_api_only.sql` (optional) removes the anon INSERT policy once `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Status: **Fixed (code)**; direct-insert policy removal **Open (manual, after env var)**.

### ▸ [Critical] Turnstile verification could be skipped by omitting the token
- Severity: Critical (bot protection) · Confidence: High (**Verified**)
- Location: `api/contact.js` old line 41 `if (turnstileToken && TURNSTILE_SECRET && …)`.
- Evidence: verification ran only when a token was present; a request without `turnstileToken` was accepted. Additionally the secret defaulted to Cloudflare's "always pass" test key, so an unset env var silently disabled verification.
- Fix: `api/_lib/turnstile.js` — when a real secret is configured, a token is **required** and must verify (403 otherwise); `remoteip` is sent; test keys are treated as "disabled" and logged as such.
- Status: **Fixed (code)**. Turnstile is only enforced when `TURNSTILE_SECRET_KEY` is a real secret → **Open (manual action: set the secret in Vercel)**.

### ▸ [High] No rate limiting, size limits or input validation on the lead endpoints
- Severity: High · Confidence: High (**Verified**)
- Location: `api/contact.js`, `api/tender.js` (old).
- Evidence: only presence checks for three fields and a loose email regex; arbitrary string lengths inserted into `TEXT`/`VARCHAR` columns; unlimited submissions per IP.
- Fix: `api/_lib/inquiry.js` + `validate.js`: max lengths, enum whitelists, phone/date validation, unknown-field rejection, link-spam heuristic, 413 for oversized bodies; per-endpoint limits by IP and by sender (see `SECURITY_HARDENING.md`); duplicate suppression. DB-level `CHECK` constraints in the migration as a second layer.
- Status: **Fixed (code)**; distributed limiter requires Upstash env → **Open (manual, recommended)**.

### ▸ [High] HTML injection into admin notification emails
- Severity: High (phishing of staff) · Confidence: High (**Verified**)
- Location: `api/contact.js` old lines 97–105, `api/tender.js` old 108–123.
- Evidence: `<p><strong>Name:</strong> ${name}</p>` — raw user input interpolated into HTML.
- Fix: `api/_lib/email.js` escapes every value; plain-text alternative included; test `escapeHtml and buildNotification never emit raw user HTML`.
- Status: **Fixed (code)**.

### ▸ [High] Unvalidated attachment passthrough
- Severity: High · Confidence: High (**Verified**)
- Location: `api/tender.js` old lines 90–96.
- Evidence: `attachment.filename` and base64 `content` forwarded to Resend with no type, size, or filename checks (client-side checks only).
- Fix: `api/_lib/attachments.js` — extension whitelist (pdf/docx/xlsx), magic-byte check, 2 MB decoded cap, path stripping and filename sanitising.
- Status: **Fixed (code)**.

### ▸ [High] Stored XSS vector in blog rendering
- Severity: High · Confidence: High (**Verified**)
- Location: `src/pages/BlogPost.tsx` old lines 159–186 (`dangerouslySetInnerHTML`).
- Evidence: regex markdown applied to **unescaped** content; `[x](javascript:alert(1))` produced an executable link; raw `<img onerror>` passed through. Combined with the Critical authorization finding, exploitable by a self-registered user.
- Fix: `src/lib/markdown.tsx` builds React elements (no HTML strings); URL scheme allow-list (`http(s)`, `mailto`, relative). `npm run check:seo` fails the build if `dangerouslySetInnerHTML` reappears.
- Status: **Fixed (code)**.

### ▸ [High] Known vulnerabilities in production dependencies
- Severity: High · Confidence: High (**Verified**: `npm audit --omit=dev` → 7 vulnerabilities, 4 high)
- Evidence: `react-router@7.15.0` (open redirect via backslash in `<Link>`/`useNavigate`, DoS, CSRF in RSC mode), `postcss` path traversal, `postcss-selector-parser` DoS.
- Fix: `react-router-dom@7.18.4`, `postcss@8.5.28`, `postcss-selector-parser@6.1.4`; unused `@headlessui/react`, `framer-motion`, `react-intersection-observer` removed. `npm audit` → 0 vulnerabilities.
- Status: **Fixed (code)**.

### ▸ [High] Missing security headers on every response
- Severity: High · Confidence: High (**Verified**: `curl -I https://rosid-sydnicate-company.vercel.app/` → only HSTS)
- Fix: `vercel.json` headers — CSP built from actual dependencies, `X-Content-Type-Options`, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, HSTS preload. Verified locally with `npm run serve`: no CSP violations on home, blog, forms.
- Status: **Fixed (code)**; takes effect on deploy.

### ▸ [Medium] `GRANT ALL ON ALL TABLES … TO anon` and default privileges
- Severity: Medium · Confidence: High (**Verified**: `20260826_admin_tables.sql` lines 156–164)
- Why it matters: RLS is the only barrier; any future table created without RLS is fully exposed to the anonymous key.
- Fix: migration revokes blanket grants and default privileges for `anon`; grants only `SELECT` on public content tables and `INSERT` on `inquiries`.
- Status: **Fixed (migration, apply manually)**.

### ▸ [Medium] Anonymous listing of the credentials storage bucket
- Severity: Medium · Confidence: High (**Verified** policy; bucket currently empty — live list returned `[]`)
- Location: `storage.objects` policy "Public can read credentials files" (`TO public USING (bucket_id = 'credentials_files')`).
- Why it matters: once internal documents are uploaded, anyone could enumerate them through the storage list API even when `is_public = false`.
- Fix: policy now allows anon SELECT only for objects whose `credentials.file_url` matches a row with `is_public = true`; admins via `is_admin()`. Public download URLs keep working.
- Remaining risk: the bucket is public, so an internal file remains fetchable by anyone who knows its (random UUID) path. Recommended follow-up in the migration comments: flip the bucket to private and rely on signed URLs (admin already uses `createSignedUrl`).
- Status: **Fixed (migration)** + **Documented (remaining risk)**.

### ▸ [Medium] `Access-Control-Allow-Origin: *` with `Allow-Credentials: true` on the lead endpoints
- Severity: Medium · Confidence: High (**Verified** live headers)
- Fix: same-site origin allow-list (production host, configured `SITE_URL`, `ALLOWED_ORIGINS`, Vercel preview hosts); cross-site browser POSTs are rejected with 403 (CSRF/hot-linked-form protection). Requests without `Origin` (server-to-server) still pass through Turnstile + rate limits.
- Status: **Fixed (code)**.

### ▸ [Medium] Silent failures reported as success
- Severity: Medium (data loss / trust) · Confidence: High (**Verified**)
- Evidence: API returned `success: true` when the DB insert failed; admin `Inquiries`/`Blog`/`Categories`/`BlogEditor` showed success toasts on Supabase errors, and `BlogEditor` navigated away after a failed save ("created (local session)"); `Content` updated rows that were never seeded.
- Fix: API returns 503 unless the lead was stored or emailed; every admin mutation reports the real result; `Content` uses upsert.
- Status: **Fixed (code)**.

### ▸ [Medium] PostgREST filter built from a URL parameter
- Severity: Medium (low impact: acts within the admin's own privileges) · Confidence: High
- Location: `src/pages/admin/BlogEditor.tsx` old lines 78 and 144 (`.or(\`id.eq.${id},slug.eq.${id}\`)`).
- Fix: id is matched against a UUID regex and queried with `.eq('id', …)` or `.eq('slug', …)`; updates target the resolved primary key.
- Status: **Fixed (code)**.

### ▸ [Medium] Hard-coded Supabase project URL and anon key in source (client and server)
- Severity: Medium (hygiene: prevents key rotation; the anon key is public by design) · Confidence: High
- Fix: removed from `src/lib/supabase.ts` and both API functions; the production build fails fast if `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing.
- Status: **Fixed (code)** → **Open (manual: confirm env vars exist in Vercel before deploying)**.

### ▸ [Medium] Production source maps published
- Severity: Low–Medium (information disclosure) · Confidence: High (`vite.config.ts` `sourcemap: true`; 3 MB `.map` in `dist`)
- Fix: `sourcemap: false`.
- Status: **Fixed (code)**.

### ▸ [Low] Admin routes indexable
- Severity: Low (protected by auth; still leaks structure) · Confidence: High (no `noindex` anywhere in the repo)
- Fix: `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store` for `/admin*` in `vercel.json`; `<meta name=robots content=noindex>` via `<Seo noindex>` in `AdminLayout`/`Login`; `Disallow: /admin` in robots.txt.
- Status: **Fixed (code)**.

### ▸ [Low] Login error echoed Supabase's message
- Severity: Low (enumeration resistance) · Confidence: High
- Fix: generic message; `autocomplete="username"/"current-password"`.
- Status: **Fixed (code)**.

### ▸ [Low] Anonymous view-counter update relied on a missing UPDATE policy
- Evidence: `supabase.from('blog_posts').update({views})` from anonymous readers silently failed under RLS (and would have allowed arbitrary values if a policy existed).
- Fix: `increment_post_views(slug)` SECURITY DEFINER RPC; client calls the RPC.
- Status: **Fixed (code + migration)**.

---

## 4. Checked with no issue observed in the audited scope

- SQL injection: all database access goes through the Supabase client with parameterised filters; no raw SQL built from input.
- Secrets in the browser bundle: only `VITE_*` public values (Supabase URL/anon key, Turnstile site key, GA id). No service-role key, Resend key or Turnstile secret is referenced from `src/`.
- Open redirects: no redirect targets are derived from user input.
- Path traversal: attachment filenames are stripped to a basename; storage paths are generated server-side from a fixed category list and a UUID.
- Session handling: Supabase JS defaults (localStorage session, auto refresh). Tokens are only sent to the Supabase origin.

## 5. Not safely verifiable from the repository

- Whether `admin_users` grandfathering will include only staff accounts (review the table after applying the migration).
- Supabase Auth rate limits and captcha settings (dashboard).
- Vercel environment variable inventory (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_*`).
- Whether the Resend sender domain is verified (`onboarding@resend.dev` only delivers to the account owner).
- Existing rows in `credentials.file_url` (paths vs full URLs) before flipping the bucket private.

## 6. Remaining risk (after applying everything)

| Risk | Level | Mitigation path |
|---|---|---|
| Migration not applied → authorization flaw persists | Critical until applied | Apply `20260919_admin_authorization.sql`, disable sign-ups |
| Rate limits are per-instance until Upstash is configured | Medium | Set `UPSTASH_REDIS_REST_URL/TOKEN` |
| Turnstile disabled until a real secret is configured | Medium | Set `TURNSTILE_SECRET_KEY` (+ `VITE_TURNSTILE_SITE_KEY`) |
| Direct anon INSERT to `inquiries` still allowed until follow-up migration | Medium | Set service-role key, apply `20260919_inquiries_api_only.sql` |
| Public bucket serves internal files to anyone with the exact path | Low–Medium | Flip bucket to private; signed URLs already used in admin |
| Single admin role (no separation between content editors and inquiry readers) | Low | Extend `admin_users` with a role column when needed |
