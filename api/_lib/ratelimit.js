// Fixed-window rate limiter with two backends:
//
//   1. Upstash Redis (REST) — distributed, survives cold starts. Enabled when
//      UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set. No SDK is
//      needed; we call the REST pipeline endpoint with fetch.
//   2. In-memory Map — best-effort fallback per function instance. Serverless
//      instances are ephemeral, so this only slows abuse down; it is NOT a
//      substitute for the Redis backend in production (see SECURITY_HARDENING.md).
//
// The limiter is fail-open by design: if Redis is unreachable we log and allow,
// because blocking every legitimate form while a third party is down is a worse
// outcome than a short window of weaker limits. Turnstile and the honeypot still
// apply in that window.

const memory = new Map()

function memoryHit(key, windowSec) {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowSec * 1000
    memory.set(key, { count: 1, resetAt })
    if (memory.size > 5000) {
      // crude GC so a flood cannot grow the map without bound
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
    }
    return { count: 1, ttl: windowSec }
  }
  entry.count += 1
  return { count: entry.count, ttl: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
}

async function upstashHit(key, windowSec) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, windowSec, 'NX'],
      ['TTL', key],
    ]),
    signal: AbortSignal.timeout(2500),
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = await res.json()
  const count = Number(data?.[0]?.result ?? 0)
  let ttl = Number(data?.[2]?.result ?? windowSec)
  if (!Number.isFinite(ttl) || ttl < 0) ttl = windowSec
  return { count, ttl }
}

export function hasDistributedBackend() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/**
 * @param {string} key      e.g. "contact:ip:1.2.3.4"
 * @param {number} limit    max hits per window
 * @param {number} windowSec window length in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, retryAfter: number, backend: string}>}
 */
export async function rateLimit(key, limit, windowSec) {
  let hit
  let backend = 'memory'
  if (hasDistributedBackend()) {
    try {
      hit = await upstashHit(`rl:${key}`, windowSec)
      backend = 'upstash'
    } catch (err) {
      console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'ratelimit.backend_error', error: String(err?.message || err) }))
      hit = memoryHit(key, windowSec)
      backend = 'memory-fallback'
    }
  } else {
    hit = memoryHit(key, windowSec)
  }
  const allowed = hit.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - hit.count),
    retryAfter: allowed ? 0 : hit.ttl,
    backend,
  }
}

/** Evaluate several limits; the first exceeded one wins. */
export async function rateLimitAll(rules) {
  for (const rule of rules) {
    const r = await rateLimit(rule.key, rule.limit, rule.windowSec)
    if (!r.allowed) return { ...r, rule: rule.name }
  }
  return { allowed: true, remaining: 0, retryAfter: 0, rule: null }
}
