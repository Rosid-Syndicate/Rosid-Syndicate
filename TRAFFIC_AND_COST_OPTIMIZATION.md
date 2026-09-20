# Traffic & Cost Optimisation

Scope: `https://www.rosiddai.com` (Vercel project `rosid-sydnicate`, Vite + React
SPA — not Next.js, so RSC/prefetch/server-action concerns map to their SPA
equivalents below). Measured 20 September 2026 with a clean headless Chrome
against production, plus the Vercel Firewall/usage snapshot supplied by the
owner. Numbers that could not be measured are marked as such.

## 1. Starting point (owner-supplied snapshot)

| Metric | Value | Reading |
|---|---|---|
| Edge requests | 1.2K / 1M | far below limits — no cost pressure today |
| Fast data transfer | 87.76 MB | dominated by first-time asset downloads and Unsplash proxies (see §3) |
| Function invocations | 1 | forms + sitemap only |
| Firewall (past day) | 640 allowed · 20 denied · 360 challenged | challenges are Bot Protection acting on non-browser clients (curl, headless QA) |
| Custom rules / rate limits | 0 / 0 | **1 rule now** (§5) |

Conclusion applied throughout: no architectural rewrites to save quota; remove
waste, cache what is public, protect what is expensive.

## 2. Request map — what a visit generates

Home page, fresh cache, no scrolling (headless Chrome, production):

| Class | Before | After | Note |
|---|---|---|---|
| HTML document | 1 | 1 | pre-rendered, served from edge cache |
| JS/CSS (`/assets/*`) | 3 | 3 | immutable, 1-year cache; ~126 kB total with brand images |
| Brand images (`/brand/*`) | 2 | 2 | WebP, 1-year cache |
| Speed Insights (`/_vercel/*`) | 1 | 1 | owner-added; same-origin, cached |
| Favicon | 1 | 1 | |
| Supabase REST (browser → `*.supabase.co`) | 3 GET + 3 CORS preflight | **0** | replaced by one same-origin, edge-cached request |
| `/api/home-content` | — | 1 (`x-vercel-cache: HIT`) | function runs ≤ once per 5 min per region |
| Cloudflare Turnstile (script + challenge) | 2 | **0** until the form is within 400 px or focused | most visitors never load it |
| Google Fonts | 1 (+woff2) | 1 (+woff2) | unchanged; self-hosting is a possible later step |
| Unsplash images | 2 (123 kB) | 2 (123 kB) | already sized via `unsplash()`; the largest transfer item |
| **Total** | **16** | **12** (+2 only when the form is reached) | |

Other pages: blog list = 1 HTML + assets + 2 Supabase queries (explicit
columns, `limit 200/100`); blog post = 1 row + 3 related + 1 view-count RPC;
admin = Supabase SDK chunk + per-page queries (private, never cached).

Nothing polls, retries in a loop, or re-fetches on hydration (checked
`AuthContext`, `Home`, `Blog*`, admin pages). React Router with `React.lazy`
does no automatic prefetching, so there is no prefetch storm to tune.

## 3. Where the bytes go

Per home visit ≈ 250 kB transferred: Unsplash 123 kB (2 images), own
JS/CSS/images 126 kB, fonts ≈ 25 kB, everything else < 3 kB. The Unsplash
images are already requested at rendered size with `auto=format` (AVIF/WebP)
and a `srcset`; they are served by Unsplash, not Vercel, so they do not count
against Vercel transfer. Own assets are immutable and cached for a year, so
repeat visits transfer only the HTML.

Not measurable from current tooling: Vercel per-route transfer breakdown and
cache HIT ratio across the whole site (the dashboard shows totals only).

## 4. Changes implemented (this pass)

1. **`/api/home-content`** — FAQs, published testimonials and the mission
   statement in one JSON response. `Cache-Control: public, max-age=60,
   s-maxage=300, stale-while-revalidate=86400`; anon-key client (RLS is the
   boundary); `no-store` on any failure; 405 for non-GET. Verified in
   production: second request `x-vercel-cache: HIT`, `age: 19`.
2. **Lazy Turnstile** on the home contact form: rendered only when the form
   is within 400 px of the viewport or receives focus; same-height placeholder
   avoids layout shift. The tender page *is* the form, so it loads immediately.
3. **Least privilege for public reads**: sitemap and home-content use
   `publicSupabase()` (anon key), never the service role.
4. **Non-canonical hosts** get `X-Robots-Tag: noindex, nofollow` at the edge
   (any host other than `www.rosiddai.com`), on top of Vercel Authentication
   which already keeps every `*.vercel.app` URL private.
5. **Edge rate limit** (Vercel Firewall): `POST /api/*` > 12 requests / 60 s
   per IP → 429, ahead of the application limits — see ABUSE_PROTECTION.md.

Earlier in the project (already live): route-level code splitting, Supabase
SDK only under `/admin`, pre-rendered home, resized Unsplash URLs (23 MB →
~0.25 MB per visit), immutable asset caching, dynamic sitemap cached 1 h.

## 5. Expected effect

- Per-visitor third-party connections on the home page: Supabase and
  Cloudflare removed from the initial load (−8 requests, −2 origins, no CORS
  preflights). Supabase read load for home content drops from *per visitor* to
  *per 5 minutes per region*.
- Vercel edge requests: +1 cached request per home visit (the content call);
  −0 elsewhere. At current volume this is immaterial; the win is fewer origin/
  database hits and a faster, more private first load.
- Function invocations: unchanged in practice (home-content is edge-cached).

## 6. Not changed, and why

- Speed Insights and Google Fonts: owner-chosen / low cost; self-hosting fonts
  would save one DNS+TLS handshake — candidate for a later pass.
- No global challenge, no prefetch changes, no HTML cache TTL changes: the
  site is already static at the edge and crawlable.
- `increment_post_views` RPC (one write per article view) is cheap; abuse
  would only inflate a vanity counter. Left as is, noted.

## 7. How to re-measure

```js
// in DevTools on https://www.rosiddai.com after a hard reload
performance.getEntriesByType('resource').reduce((a,e)=>{const h=new URL(e.name).host;a[h]=(a[h]||0)+1;return a},{})
```
`fetch('/api/home-content').then(r=>r.headers.get('x-vercel-cache'))` should
return `HIT` on the second call within 5 minutes.
