// Shared HTTP helpers for the Vercel serverless functions.
// Plain ESM (package.json has "type": "module").

const DEFAULT_SITE_URL = 'https://www.rosiddai.com'
// Always accepted besides the configured site URL: the apex host (Vercel
// redirects it to www, but a cached page may still POST from it) and the
// original *.vercel.app production alias.
const LEGACY_ORIGINS = ['https://rosiddai.com', 'https://rosid-sydnicate-company.vercel.app']

/** Origins allowed to call the form endpoints from a browser. */
export function allowedOrigins() {
  const configured = (process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
  const set = new Set([configured, DEFAULT_SITE_URL, ...LEGACY_ORIGINS, ...extra])
  // Vercel preview deployments (https://<project>-<hash>-<team>.vercel.app)
  return set
}

function isVercelPreview(origin) {
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

/**
 * Browser POSTs always carry an Origin header. We accept same-site origins and
 * Vercel preview URLs, and reject anything else (CSRF / hot-linked form abuse).
 * Requests without an Origin (server-to-server, curl) are allowed through this
 * check and must still pass Turnstile + rate limiting.
 */
export function checkOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return { ok: true, origin: null }
  const allowed = allowedOrigins()
  if (allowed.has(origin) || isVercelPreview(origin)) return { ok: true, origin }
  return { ok: false, origin }
}

export function applyCors(req, res) {
  const origin = req.headers.origin
  if (origin && (allowedOrigins().has(origin) || isVercelPreview(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '600')
}

export function securityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
}

/**
 * Client IP. Trust boundary: Vercel's edge terminates TLS and sets
 * `x-real-ip` / `x-vercel-forwarded-for` itself; those cannot be spoofed by the
 * client. `x-forwarded-for` is used last, taking the FIRST hop, because Vercel
 * rewrites it — but we never trust it ahead of the Vercel-set headers.
 */
export function clientIp(req) {
  const h = req.headers
  const candidates = [h['x-vercel-forwarded-for'], h['x-real-ip'], h['x-forwarded-for']]
  for (const c of candidates) {
    if (!c) continue
    const first = String(c).split(',')[0].trim()
    if (first) return first
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function json(res, status, body, extraHeaders = {}) {
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v)
  return res.status(status).json(body)
}

/** Reject bodies over `maxBytes` before doing any work. */
export function bodyTooLarge(req, maxBytes) {
  const len = Number(req.headers['content-length'] || 0)
  if (len && len > maxBytes) return true
  try {
    const size = Buffer.byteLength(JSON.stringify(req.body ?? {}), 'utf8')
    return size > maxBytes
  } catch {
    return true
  }
}

/**
 * Structured security log line (JSON). Never log raw PII: emails are hashed,
 * messages are not logged.
 */
export async function securityLog(event, fields = {}) {
  if (process.env.LOG_SILENT === '1') return
  const line = { ts: new Date().toISOString(), event, ...fields }
  console.log(JSON.stringify(line))
}

export async function sha256(text) {
  const { createHash } = await import('node:crypto')
  return createHash('sha256').update(String(text)).digest('hex')
}
