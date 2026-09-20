// Shared pipeline for the public lead endpoints (/api/contact, /api/tender).
//
// Order of controls (cheapest first):
//   1. method + origin + body size
//   2. honeypot            → pretend success, log, do nothing
//   3. schema validation   → 400 with a field-level message
//   4. rate limits         → 429 + Retry-After (IP and email based)
//   5. Turnstile           → 403 when enforced and missing/invalid
//   6. duplicate detection → idempotent 200 (same sender + same message within 10 min)
//   7. persist (Supabase) then notify (Resend)
//
// Response contract (unchanged for the frontend):
//   200 { success: true,  message }
//   4xx/5xx { error }

import { applyCors, bodyTooLarge, checkOrigin, clientIp, json, securityHeaders, securityLog, sha256 } from './http.js'
import { rateLimitAll } from './ratelimit.js'
import { claim, release } from './dedupe.js'
import { turnstileMode, verifyTurnstile } from './turnstile.js'
import { buildNotification, isEmailConfigured, sendNotification } from './email.js'
import { serverSupabase, supabaseMode } from './supabase.js'

const SUCCESS = { success: true, message: 'Message sent successfully.' }

/**
 * @param {import('http').IncomingMessage & {body:any}} req
 * @param {import('http').ServerResponse & {status:Function}} res
 * @param {object} spec
 * @param {string}   spec.name           'contact' | 'tender'
 * @param {number}   spec.maxBodyBytes
 * @param {string[]} spec.allowedKeys    accepted body keys (others are rejected)
 * @param {(body:any)=>{ok:true, data:object, attachment?:object|null}|{ok:false, error:string}} spec.parse
 * @param {(data:object)=>object} spec.toRow           → inquiries row
 * @param {(data:object)=>{subject:string, heading:string, intro:string, rows:Array, message:string}} spec.toEmail
 * @param {Array<{name:string, limit:number, windowSec:number, key:(ctx:{ip:string,emailHash:string})=>string}>} spec.limits
 */
export async function handleInquiry(req, res, spec) {
  applyCors(req, res)
  securityHeaders(res)

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' }, { Allow: 'POST, OPTIONS' })

  const ip = clientIp(req)
  const origin = checkOrigin(req)
  if (!origin.ok) {
    await securityLog('inquiry.blocked_origin', { endpoint: spec.name, ip, origin: origin.origin })
    return json(res, 403, { error: 'Request origin not allowed.' })
  }

  if (bodyTooLarge(req, spec.maxBodyBytes)) {
    await securityLog('inquiry.body_too_large', { endpoint: spec.name, ip })
    return json(res, 413, { error: 'Request too large.' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // 2. honeypot — bots fill hidden fields; humans never see it.
  if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
    await securityLog('inquiry.honeypot', { endpoint: spec.name, ip })
    return json(res, 200, SUCCESS)
  }

  // 3. schema
  const unexpected = Object.keys(body).filter((k) => !spec.allowedKeys.includes(k))
  if (unexpected.length) {
    return json(res, 400, { error: `Unexpected fields: ${unexpected.slice(0, 5).join(', ')}` })
  }
  const parsed = spec.parse(body)
  if (!parsed.ok) return json(res, 400, { error: parsed.error })
  const data = parsed.data
  const emailHash = (await sha256(data.email)).slice(0, 16)

  // 4. rate limits (IP + sender)
  const rl = await rateLimitAll(spec.limits.map((l) => ({ ...l, key: l.key({ ip, emailHash }) })))
  if (!rl.allowed) {
    await securityLog('inquiry.rate_limited', { endpoint: spec.name, ip, emailHash, rule: rl.rule, backend: rl.backend })
    return json(
      res,
      429,
      { error: 'Too many submissions. Please try again later.' },
      { 'Retry-After': String(Math.max(1, rl.retryAfter)) }
    )
  }

  // 5. Turnstile
  const ts = await verifyTurnstile(body.turnstileToken, ip)
  if (!ts.ok) {
    await securityLog('inquiry.turnstile_failed', { endpoint: spec.name, ip, emailHash, reason: ts.reason })
    return json(res, 403, { error: 'Security verification failed. Please refresh the page and try again.' })
  }

  // 6. duplicate detection (idempotency): same sender + same content within 10 minutes.
  //    The claim is released below if persistence fails, so a genuine retry works.
  const dupKey = `${spec.name}:${emailHash}:${(await sha256(JSON.stringify(spec.toRow(data)))).slice(0, 16)}`
  const fresh = await claim(dupKey, 600)
  if (!fresh) {
    await securityLog('inquiry.duplicate_suppressed', { endpoint: spec.name, ip, emailHash })
    return json(res, 200, SUCCESS)
  }

  // Local / preview QA: exercise the whole pipeline without writing to the
  // production database or sending email. Never set in production.
  if (process.env.INQUIRY_DRY_RUN === '1') {
    await securityLog('inquiry.dry_run', { endpoint: spec.name, ip, emailHash, turnstile: ts.reason })
    return json(res, 200, { ...SUCCESS, dryRun: true })
  }

  // 7. persist, then notify
  let stored = false
  let dbError = null
  const supabase = serverSupabase()
  if (supabase) {
    const { error } = await supabase.from('inquiries').insert(spec.toRow(data))
    if (error) dbError = error.message
    else stored = true
  } else {
    dbError = 'supabase-unconfigured'
  }

  let emailed = false
  let emailError = null
  if (isEmailConfigured()) {
    const e = spec.toEmail(data)
    const { html, text } = buildNotification({ ...e, replyTo: data.email })
    const attachments = parsed.attachment ? [{ filename: parsed.attachment.filename, content: parsed.attachment.content }] : undefined
    const result = await sendNotification({ subject: e.subject, html, text, replyTo: data.email, attachments })
    emailed = result.sent
    if (!result.sent) emailError = result.error
  }

  await securityLog('inquiry.processed', {
    endpoint: spec.name,
    ip,
    emailHash,
    stored,
    emailed,
    dbError,
    emailError,
    turnstile: ts.reason,
    turnstileMode: turnstileMode(),
    dbMode: supabaseMode(),
    rateLimitBackend: rl.backend,
    hasAttachment: Boolean(parsed.attachment),
  })

  // Only claim success if the lead was captured somewhere.
  if (!stored && !emailed) {
    await release(dupKey)
    return json(res, 503, { error: 'We could not record your message right now. Please try again shortly or email us directly.' })
  }
  return json(res, 200, SUCCESS)
}
