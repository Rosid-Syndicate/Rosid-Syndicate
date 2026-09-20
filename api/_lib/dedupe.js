// Idempotency / duplicate suppression for form submissions.
// `claim` atomically records a fingerprint for `ttlSec`; `release` removes it
// so that a submission which FAILED to persist can be retried immediately.
// Same backend strategy as ratelimit.js (Upstash REST when configured, else
// in-memory best effort).

import { hasDistributedBackend } from './ratelimit.js'

const memory = new Map()

async function upstash(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2500),
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  return res.json()
}

/** @returns {Promise<boolean>} true if this fingerprint was NOT seen before */
export async function claim(key, ttlSec) {
  if (hasDistributedBackend()) {
    try {
      const data = await upstash([['SET', `dd:${key}`, '1', 'EX', ttlSec, 'NX']])
      return data?.[0]?.result === 'OK'
    } catch (err) {
      console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'dedupe.backend_error', error: String(err?.message || err) }))
    }
  }
  const now = Date.now()
  const entry = memory.get(key)
  if (entry && entry > now) return false
  memory.set(key, now + ttlSec * 1000)
  if (memory.size > 5000) for (const [k, v] of memory) if (v <= now) memory.delete(k)
  return true
}

export async function release(key) {
  memory.delete(key)
  if (hasDistributedBackend()) {
    try {
      await upstash([['DEL', `dd:${key}`]])
    } catch {
      /* best effort */
    }
  }
}
