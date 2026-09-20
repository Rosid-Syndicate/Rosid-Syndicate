# Security Architecture

How the pieces fit, what each layer is trusted to do, and where the
boundaries are. Companion to SECURITY_AUDIT.md (findings), SECURITY_HARDENING.md
(controls and operating requirements), ABUSE_PROTECTION.md (bot/abuse rules)
and API_SECURITY_MATRIX.md (per-endpoint inventory).

## 1. Topology

```
 Visitor ──► Vercel edge (bom1 + global)                     ┐
             │  TLS, HSTS, CSP + headers (vercel.json)        │ public surface
             │  Firewall: Bot Protection, AI-bot deny,        │ www.rosiddai.com
             │  POST /api/* rate limit, OWASP CRS (log)       │
             │  Deployment Protection: *.vercel.app → login   ┘
             ├─ static: pre-rendered / SPA shell, /assets, /brand (immutable)
             ├─ /api/home-content  (GET, edge-cached 5 min, anon DB read)
             ├─ /api/sitemap       (GET, edge-cached 1 h, anon DB read)
             └─ /api/contact, /api/tender (POST) ──► inquiry pipeline
                    origin check → size → honeypot → schema → rate limits
                    → Turnstile siteverify (hostname-bound) → dedupe claim
                    → insert (service role) → email (Resend) → structured log
                                                    │
 Browser ──────────────────────────────────────────►│ Supabase (yemiingdtfelkfcagins)
   public pages: PostgREST reads with anon key      │   Postgres + RLS (deny by default)
   admin: Supabase JS SDK (loaded only under /admin)│   Auth: password (+ optional Turnstile CAPTCHA), sign-ups off
                                                    │   Storage: credentials_files (public read), site-media (staff write)
 Cloudflare Turnstile ◄── widget on forms; token verified server-side only
```

## 2. Trust boundaries

| Boundary | Trusted to | Never trusted for |
|---|---|---|
| Browser | render, collect input, hold the user's own session | authorization, validation, bot decisions, "success" state of the Turnstile widget |
| Vercel edge | TLS, headers, coarse rate limiting, bot challenge, keeping non-custom hosts private | data authorization |
| API functions | validation, rate limits, siteverify, idempotency, writes with the service role | serving private reads (they don't) |
| Supabase RLS + `staff_role()` | the only data-authorization decision for every table and bucket | — |
| Supabase Auth | identity; sign-ups disabled; JWT carries email used by `staff_role()` | admin membership (that is `admin_users`) |

Service-role key: server functions only (`SUPABASE_SERVICE_ROLE_KEY`, type
Secret on Vercel). Public reads from functions use the anon key on purpose so
a bug in a public endpoint cannot widen exposure beyond RLS.

## 3. Identity and roles

- `admin_users(email, role ∈ {admin, editor}, is_active, user_id)`; a row is
  linked to the auth user on first sign-in (`link_admin_user()`); the trigger
  `protect_last_admin` keeps ≥ 1 active admin.
- `staff_role()` / `is_admin()` / `is_staff()` (SECURITY DEFINER, `search_path`
  pinned) are the predicates in every policy. Editors: content tables only.
- Client `ProtectedRoute` and role-aware navigation are UX; RLS is the gate.
- Sessions: Supabase defaults (JWT + refresh in localStorage, only ever sent
  to the Supabase origin; API functions never receive them).

## 4. Public vs private

| Surface | Public? | Indexable? | Cached? |
|---|---|---|---|
| Marketing pages, blog, credentials, policies | yes | yes (sitemap, canonical www) | HTML/assets at edge |
| `/api/home-content`, `/sitemap.xml` | yes | no (`X-Robots-Tag`) | yes, short TTL |
| `/admin/*` | shell is public HTML; every data read needs a staff session | no (`noindex`, `no-store`) | never |
| `*.vercel.app` hosts | no (Vercel Authentication) | no | — |
| Uploads: `credentials_files` (documents linked to public credentials), `site-media` (images) | read yes | n/a | CDN |

## 5. Secrets

Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`,
`RESEND_API_KEY`, `UPSTASH_*`. Public by design: `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`, `VITE_SITE_URL`. No secret
is hard-coded; the production build fails if the public Supabase pair is
missing. `vercel env pull` writes `[Sensitive]` placeholders for secrets — the
local emulator must not run with those lines (they are stripped from
`.env.local`).

## 6. Failure behaviour

- Supabase unreachable: public pages render bundled content; `/api/home-content`
  returns 503 with `no-store` (never cached); forms return 503 (no fake
  success) and release the dedupe claim.
- Cloudflare siteverify unreachable: fail-open with a log line; honeypot and
  rate limits still apply (documented trade-off — flip to fail-closed if abuse
  appears).
- Email unavailable: the lead is still stored; 200 is returned only if at
  least one of store/email succeeded.

## 7. What is deliberately not done

No WAF challenge on every request, no country blocks, no IP bans from counts,
no JA4 rules without an abusive pattern, no `noindex` as access control, no
caching of any authenticated response, no client-side-only security checks.
