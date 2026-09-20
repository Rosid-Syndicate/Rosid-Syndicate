// Cloudflare Turnstile server-side verification.
//
// Modes:
//   - `enforced`  TURNSTILE_SECRET_KEY is set to a real secret → a token is
//                 REQUIRED and must verify. Missing/invalid token ⇒ 403.
//   - `disabled`  no secret, or the Cloudflare "always pass" test secret →
//                 verification is skipped (development). This is logged so it is
//                 visible in production logs if someone forgets the env var.
//
// Transport failures (siteverify unreachable) are fail-open with a log line;
// the honeypot and rate limits still apply in that window.

const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA', // always passes
  '2x0000000000000000000000000000000AA', // always fails
  '3x0000000000000000000000000000000AA', // token already spent
])

export function turnstileMode() {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || TEST_SECRETS.has(secret)) return 'disabled'
  return 'enforced'
}

/**
 * @returns {Promise<{ok: boolean, reason: string}>}
 */
export async function verifyTurnstile(token, remoteip) {
  const mode = turnstileMode()
  if (mode === 'disabled') return { ok: true, reason: 'disabled' }

  if (!token || typeof token !== 'string' || token.length > 2048) {
    return { ok: false, reason: 'missing-token' }
  }

  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token })
  if (remoteip && remoteip !== 'unknown') body.set('remoteip', remoteip)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    if (data && data.success === true) return { ok: true, reason: 'verified' }
    return { ok: false, reason: `failed:${(data?.['error-codes'] || []).join(',') || 'unknown'}` }
  } catch (err) {
    console.warn(JSON.stringify({ ts: new Date().toISOString(), event: 'turnstile.transport_error', error: String(err?.message || err) }))
    return { ok: true, reason: 'transport-error-fail-open' }
  }
}
