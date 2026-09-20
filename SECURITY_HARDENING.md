# SECURITY_HARDENING.md — implemented controls and operating requirements

Companion to `SECURITY_AUDIT.md`. This document describes what the codebase now
enforces, the limits chosen and why, and the configuration that must be done
outside the repository for every control to be active.

---

## 1. Control map

| Layer | Control | Where |
|---|---|---|
| Edge / platform | HSTS, CSP, nosniff, frame denial, referrer & permissions policies, COOP; `noindex` + `no-store` on `/admin*`; immutable asset caching; real 404s | `vercel.json` |
| API (lead endpoints) | Same-site origin check, method allow-list, body size cap, honeypot, strict schema, per-endpoint rate limits (IP + sender), Turnstile, duplicate suppression, escaped email, attachment validation, structured logging, honest status codes | `api/_lib/*.js`, `api/contact.js`, `api/tender.js` |
| Database | Admin allow-list + `is_admin()` policies, narrowed anon grants, CHECK constraints, storage listing guard, RPC for view counter | `supabase/migrations/20260919_*.sql` |
| Client | Single write path through the API, no hard-coded credentials, safe markdown renderer (https images only), generic auth errors, noindex on private views, role-aware admin UI, client-side image validation before upload | `src/lib/leads.ts`, `src/lib/supabase.ts`, `src/lib/markdown.tsx`, admin pages |
| Build | Fails when public Supabase env is missing; route/manifest drift check; no source maps; 0 known vulnerabilities | `vite.config.ts`, `scripts/check-seo-routes.mjs` |

---

## 2. Rate-limit matrix

Fixed windows, evaluated cheapest-first, after honeypot and schema validation
(so garbage never consumes a slot for a real sender). Limits are per endpoint;
there is deliberately no global limit.

| Endpoint | Key | Limit | Window | Rationale |
|---|---|---|---|---|
| `POST /api/contact` | IP | 5 | 1 h | A person sends one or two messages; a shared office NAT may send a few. |
| `POST /api/contact` | IP | 15 | 24 h | Caps sustained low-rate abuse from one address. |
| `POST /api/contact` | sender email (SHA-256, truncated) | 5 | 24 h | Stops one identity flooding across IPs. |
| `POST /api/tender` | IP | 3 | 1 h | Tender submissions are rarer and carry attachments. |
| `POST /api/tender` | IP | 8 | 24 h | |
| `POST /api/tender` | sender email | 4 | 24 h | |
| both | duplicate fingerprint (sender + row content) | 1 | 10 min | Idempotency: double-clicks and retries return success without a second row/email; released if persistence fails. |
| `GET /api/sitemap` | — | edge cache `s-maxage=3600` | | Not user-writable; caching is the cost control. |

Responses: `429 Too Many Requests` with `Retry-After: <seconds>` and a plain
message; the client shows the wait time in minutes.

**Backends.** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` enable the
distributed limiter (REST pipeline `INCR`/`EXPIRE NX`/`TTL`, ~1 round trip). Without
them the limiter is in-memory per function instance — it slows abuse but does
not survive cold starts. Fail-open on backend errors (logged) so a Redis outage
never blocks legitimate leads; Turnstile and honeypot remain active.

**Client IP.** Trusted order: `x-vercel-forwarded-for` → `x-real-ip` (both set by
Vercel's proxy) → first hop of `x-forwarded-for` → socket address. The trusted
proxy terminates at Vercel; no Cloudflare proxy is in front of this deployment
today. If Cloudflare is added later, prefer `cf-connecting-ip` and restrict
origin access to Cloudflare IP ranges.

---

## 3. Bot-defence architecture (layered, risk-based)

| Traffic class | Behaviour |
|---|---|
| Normal human | Fills the visible form; honeypot empty; Turnstile passes silently (managed mode); one request → 200. |
| Legitimate search crawler | Public HTML, `robots.txt`, `/sitemap.xml` fully available; only `/admin`, `/api` and the empty `/project/` route are disallowed. No IP or UA blocking anywhere. |
| Authenticated admin | Supabase session; every table access gated by `is_admin()`; `/admin*` is `noindex`, `no-store`. |
| Unknown automation (curl, scripts) | No `Origin` → still allowed to reach validation, then must pass Turnstile (when enforced) and rate limits. Unknown fields → 400. |
| Suspicious automation | Cross-site `Origin` → 403. Honeypot filled → fake 200, nothing stored, logged. Turnstile failure → 403. Link-heavy message → 400. |
| Abusive traffic | Rate limits → 429 with `Retry-After`; duplicate fingerprints → idempotent 200. Oversized body → 413. |

Turnstile modes: **enforced** when `TURNSTILE_SECRET_KEY` is a real secret
(token required); **disabled** when unset or a Cloudflare test key (logged in
every `inquiry.processed` event as `turnstileMode`). Transport failure to
`siteverify` is fail-open with a `turnstile.transport_error` log line, so a
Cloudflare outage degrades to honeypot + rate limits instead of blocking leads.

---

## 4. Authentication and authorization protection matrix

| Surface | Control | Status |
|---|---|---|
| Sign-up | Must be disabled in Supabase dashboard (public sign-up currently enabled) | **Manual** |
| Sign-in | Supabase Auth defaults (bcrypt, JWT, refresh). Generic error message in UI; the "return to" path after login is validated to stay under `/admin`. Supabase's built-in auth rate limits apply | Code done; review dashboard limits |
| Sign-in CAPTCHA | Opt-in: with `VITE_AUTH_CAPTCHA=true` (and a site key) the login and reset forms render Turnstile and forward the token (`captchaToken`) to Supabase Auth; submission is never blocked client-side. Enforcement happens in Supabase: Authentication → Attack protection → Enable CAPTCHA (Turnstile) with the matching secret | Code done; **Manual** to enforce |
| Password reset | "Forgot password?" calls `resetPasswordForEmail` with the same response whether or not the address exists; the link lands on `/admin/reset-password`, which only shows the new-password form while the recovery session is present (min. 10 characters; expired/reused links get a clear message) | Code done; redirect URL must be allow-listed (§10) |
| Google sign-in | Hidden unless `VITE_AUTH_GOOGLE_SIGNIN=true`. Requires the Google provider in Supabase; the allow-list (`admin_users`) still decides who gets a role, and with sign-ups disabled only existing auth users can use it | Off by default |
| Staff membership & roles | `public.admin_users` (email-based rows, `role` = `admin` or `editor`, `is_active`); `staff_role()`, `is_admin()`, `is_staff()` used by every RLS policy. Rows link to the auth user on first sign-in (`link_admin_user()`); a trigger prevents removing or demoting the last active admin | Migration |
| Editor role | Content tables only (blog posts, categories, testimonials, FAQs, site content). No inquiries, credentials, companies or staff management — enforced by RLS and mirrored in the admin navigation | Migration + code |
| Table access (anon) | SELECT on published/public rows only; INSERT on `inquiries` with `status = 'New'` (until `20260919_inquiries_api_only.sql`) | Migration |
| Table access (authenticated, non-staff) | Nothing beyond anon | Migration |
| Storage | `credentials_files`: anon read/list only files linked to `is_public` credentials; admins full. `site-media`: public read, staff write, 5 MB, image MIME types only (bucket config); the client validates type/size and downsizes to WebP ≤1800 px before upload | Migration + code |
| Client route guard | `ProtectedRoute` redirects unauthenticated users to `/admin/login`, shows a "no admin access" state for signed-in non-staff, and keeps `/admin/users` admin-only (UX only; RLS is the boundary) | Code |
| IDOR | No user-scoped resources exist; all admin resources are group-wide by design. Inquiry ids are UUIDs; access is governed by `is_admin()` | Verified |

---

## 5. Security headers (as deployed by `vercel.json`)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy:
  default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self';
  script-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com
              https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com
              https://*.analytics.google.com https://fonts.googleapis.com https://fonts.gstatic.com;
  frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; manifest-src 'self';
  upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
/admin*      → X-Robots-Tag: noindex, nofollow · Cache-Control: no-store
/api/contact, /api/tender → X-Robots-Tag: noindex, nofollow (functions also send no-store, nosniff)
/assets/*    → Cache-Control: public, max-age=31536000, immutable
```

Why these choices: `style-src 'unsafe-inline'` is required by `react-hot-toast`
(injects a `<style>` element) and Google Fonts; it does not enable script
execution. `img-src https:` lets admins use any https image URL for blog
covers. No inline scripts exist (fonts are attached from `main.tsx`), so
`script-src` needs no nonce or `'unsafe-inline'`. Verified with the local
Vercel emulator (`npm run serve`) — no CSP violations on home, blog post,
contact/tender forms, admin login.

---

## 6. Secrets and environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | build (public) | Browser client. **Required** — production build fails without them. |
| `VITE_SITE_URL` | build (public) | Canonical origin for SEO, robots, sitemap. Defaults to the Vercel host; set when the custom domain is live. |
| `VITE_TURNSTILE_SITE_KEY` | build (public) | Widget key. Test key used if unset. |
| `VITE_GA_MEASUREMENT_ID` | build (public) | Optional GA4. |
| `TURNSTILE_SECRET_KEY` | server | Enables enforced verification. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Preferred for API inserts; enables closing anon inserts. **Never** `VITE_`-prefixed. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | server | Fallbacks if the `VITE_` names are not exposed to functions. |
| `RESEND_API_KEY`, `CONTACT_EMAIL_TO` (or `CONTACT_EMAIL`), `CONTACT_EMAIL_FROM` | server | Notifications. `CONTACT_EMAIL_FROM` must be on a Resend-verified domain. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server | Distributed rate limiting + dedupe. |
| `SITE_URL`, `ALLOWED_ORIGINS` | server | Origin allow-list for the API (comma-separated extras). |
| `INQUIRY_DRY_RUN` | local only | QA mode; never set in production. |

Rules: server secrets are read only in `api/`; nothing under `src/` references
them; `.env*` files are git-ignored; logs hash the sender email and never
include message bodies, tokens or keys.

---

## 7. Logging and monitoring

Structured JSON lines to Vercel function logs (`api/_lib/http.js →
securityLog`). Events: `inquiry.blocked_origin`, `inquiry.body_too_large`,
`inquiry.honeypot`, `inquiry.rate_limited` (with rule + backend),
`inquiry.turnstile_failed` (reason), `inquiry.duplicate_suppressed`,
`inquiry.processed` (stored/emailed/dbError/emailError/turnstileMode/dbMode),
`ratelimit.backend_error`, `turnstile.transport_error`, `sitemap.supabase_error`.

Recommended alerting (Vercel log drains or a query): spikes of
`rate_limited`/`turnstile_failed`, any `processed` with `stored=false`, any
`turnstileMode=disabled` in production.

---

## 8. Cloudflare requirements

Not currently in front of the site. If adopted: proxy the domain, enable WAF
managed rules and bot fight mode, add a rate-limit rule for `/api/*` (e.g. 20
req/min/IP) as an outer layer, keep Turnstile, and switch the API's client-IP
source to `cf-connecting-ip`. Do **not** challenge `/sitemap.xml`, `/robots.txt`
or public pages for verified search bots.

## 9. Vercel requirements

1. Environment variables from §6 (production + preview).
2. Deploy from this branch after review; `vercel.json` is applied automatically.
3. Confirm the custom domain when it exists and set `VITE_SITE_URL` accordingly.

## 10. Supabase requirements

**Status (20 Sep 2026):** the original project (`mlfakixbqzgttwzqinvl`) no longer
exists (NXDOMAIN). The site now targets project **`yemiingdtfelkfcagins`
("Rosid-Sydnicate")**, where steps 1, 3 and 4 below have been applied with the
Supabase CLI: all four schema migrations, `enable_signup = false`, Site URL and
redirect URLs (declared in `supabase/config.toml`, applied with
`npx supabase config push`). `admin.rosid@gmail.com` is the first active admin.

1. Apply `supabase/migrations/20260919_admin_authorization.sql`, then `20260919_admin_roles_content.sql` in the SQL editor.
2. Review `public.admin_users` (email, role, is_active); remove non-staff accounts. Add colleagues from Admin → Users & roles, then create their login in Authentication → Users — the browser never holds a service key, so it cannot create auth accounts itself.
3. Authentication → Providers → Email → disable new sign-ups.
4. Authentication → URL Configuration → set Site URL to the production origin and add `<origin>/admin/reset-password` (plus preview origins if used) to Redirect URLs, otherwise reset links fall back to the Site URL.
5. Optional: Authentication → Attack protection → Enable CAPTCHA with the Turnstile secret used for the forms; the login page already sends the token when `VITE_TURNSTILE_SITE_KEY` is set.
6. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel, then apply `20260919_inquiries_api_only.sql`.
7. Optional: `UPDATE storage.buckets SET public = false WHERE id = 'credentials_files'` after confirming `credentials.file_url` values are storage paths (the public page then needs signed URLs — small change in `src/pages/Credentials.tsx`).

---

## 11. Manual verification checklist

- [ ] `GET /auth/v1/settings` shows `disable_signup: true`
- [ ] As a non-admin test user (temporarily), `select * from inquiries` returns 0 rows; as admin it returns data
- [ ] Contact form: one row per submission in `inquiries`; email received with reply-to set
- [ ] Contact form with `turnstileToken` omitted via curl → 403 (when secret configured)
- [ ] 6th submission from one IP within an hour → 429 with `Retry-After`
- [ ] `curl -I https://<host>/` shows the CSP and security headers; browser console has no CSP violations on home, a blog post, `/tender-inquiry`, `/admin/login`
- [ ] `https://<host>/admin/dashboard` response carries `X-Robots-Tag: noindex, nofollow`
- [ ] `https://<host>/some-unknown-page` returns HTTP 404
- [ ] `https://<host>/sitemap.xml` lists the real host and current blog posts
- [ ] `npm audit --omit=dev` → 0 vulnerabilities
