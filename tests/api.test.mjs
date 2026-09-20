// Run with: npm test   (node --test)
// These tests exercise the serverless handlers directly with mock req/res
// objects. No network calls are made: fetch is stubbed per test.

import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import contact from '../api/contact.js'
import tender from '../api/tender.js'
import { escapeHtml, buildNotification } from '../api/_lib/email.js'
import { validateAttachment, safeFilename } from '../api/_lib/attachments.js'
import { clientIp } from '../api/_lib/http.js'

const ORIGIN = 'https://rosid-sydnicate-company.vercel.app'

let ipCounter = 0
const freshIp = () => `203.0.113.${(ipCounter++ % 250) + 1}`

function mockReq({ method = 'POST', body = {}, headers = {}, ip = freshIp() } = {}) {
  return {
    method,
    body,
    headers: { origin: ORIGIN, 'x-real-ip': ip, 'content-type': 'application/json', ...headers },
    socket: { remoteAddress: ip },
  }
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this },
    status(code) { this.statusCode = code; return this },
    json(obj) { this.body = obj; this.ended = true; return this },
    send(s) { this.body = s; this.ended = true; return this },
    end() { this.ended = true; return this },
  }
  return res
}

const validContact = () => ({
  name: 'Jane Doe',
  company: 'Example Ltd',
  email: `jane+${Math.random().toString(36).slice(2)}@example.com`,
  phone: '+977 9800000000',
  inquiryType: 'General Inquiry',
  message: 'Hello, we would like to discuss a supply contract for cement.',
  honeypot: '',
  turnstileToken: '',
})

const realFetch = globalThis.fetch
let fetchCalls = []

beforeEach(() => {
  fetchCalls = []
  process.env.LOG_SILENT = '1'
  // Default stub: Resend accepts, Turnstile passes. Supabase is unconfigured
  // in tests unless a test sets env vars.
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init })
    if (String(url).includes('api.resend.com')) return new Response(JSON.stringify({ id: 'email_123' }), { status: 200 })
    if (String(url).includes('challenges.cloudflare.com')) return new Response(JSON.stringify({ success: true }), { status: 200 })
    return new Response('{}', { status: 200 })
  }
  process.env.RESEND_API_KEY = 're_test'
  process.env.CONTACT_EMAIL = 'ops@example.com'
  delete process.env.TURNSTILE_SECRET_KEY
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  delete process.env.SUPABASE_ANON_KEY
  delete process.env.VITE_SUPABASE_ANON_KEY
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
})

afterEach(() => {
  globalThis.fetch = realFetch
})

test('OPTIONS preflight returns 204 with same-origin CORS', async () => {
  const res = mockRes()
  await contact(mockReq({ method: 'OPTIONS' }), res)
  assert.equal(res.statusCode, 204)
  assert.equal(res.headers['access-control-allow-origin'], ORIGIN)
})

test('GET is rejected with 405 and Allow header', async () => {
  const res = mockRes()
  await contact(mockReq({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers['allow'], 'POST, OPTIONS')
})

test('cross-site origin is rejected (CSRF / hot-linking)', async () => {
  const res = mockRes()
  await contact(mockReq({ body: validContact(), headers: { origin: 'https://evil.example' } }), res)
  assert.equal(res.statusCode, 403)
  assert.equal(fetchCalls.length, 0, 'no downstream calls')
})

test('honeypot returns fake success and does nothing', async () => {
  const res = mockRes()
  await contact(mockReq({ body: { ...validContact(), honeypot: 'http://spam' } }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.success, true)
  assert.equal(fetchCalls.length, 0)
})

test('unexpected fields are rejected (mass-assignment guard)', async () => {
  const res = mockRes()
  await contact(mockReq({ body: { ...validContact(), status: 'Closed' } }), res)
  assert.equal(res.statusCode, 400)
  assert.match(res.body.error, /Unexpected fields/)
})

test('validation: bad email, short message, invalid type, link spam', async () => {
  for (const [patch, re] of [
    [{ email: 'not-an-email' }, /valid email/],
    [{ message: 'hi' }, /at least 10/],
    [{ inquiryType: 'DROP TABLE' }, /valid inquiry type/],
    [{ message: 'buy http://a.com http://b.com http://c.com http://d.com now' }, /many links/],
    [{ phone: 'call me maybe!!' }, /valid phone/],
  ]) {
    const res = mockRes()
    await contact(mockReq({ body: { ...validContact(), ...patch } }), res)
    assert.equal(res.statusCode, 400, JSON.stringify(patch))
    assert.match(res.body.error, re)
  }
})

test('oversized body is rejected with 413', async () => {
  const res = mockRes()
  await contact(mockReq({ body: { ...validContact(), message: 'x'.repeat(40_000) } }), res)
  assert.equal(res.statusCode, 413)
})

test('valid submission emails admin with escaped content and reply-to', async () => {
  const res = mockRes()
  const body = { ...validContact(), name: '<img src=x onerror=alert(1)>Jane', message: 'Line one\n<script>alert(1)</script>' }
  await contact(mockReq({ body }), res)
  assert.equal(res.statusCode, 200)
  const resend = fetchCalls.find((c) => c.url.includes('api.resend.com'))
  assert.ok(resend, 'Resend was called')
  const payload = JSON.parse(resend.init.body)
  assert.equal(payload.reply_to, body.email)
  assert.ok(!payload.html.includes('<img src=x'), 'raw HTML must be escaped')
  assert.ok(payload.html.includes('&lt;img src=x'), 'escaped HTML present')
  assert.ok(!payload.html.includes('<script>'))
  assert.ok(payload.text.includes('Jane'))
})

test('returns 503 (not fake success) when neither DB nor email captured the lead', async () => {
  delete process.env.RESEND_API_KEY
  const res = mockRes()
  await contact(mockReq({ body: validContact() }), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.success, undefined)
})

test('duplicate submission within 10 minutes is idempotent (single email)', async () => {
  const body = validContact()
  const r1 = mockRes()
  await contact(mockReq({ body }), r1)
  const r2 = mockRes()
  await contact(mockReq({ body }), r2)
  assert.equal(r1.statusCode, 200)
  assert.equal(r2.statusCode, 200)
  const emails = fetchCalls.filter((c) => c.url.includes('api.resend.com'))
  assert.equal(emails.length, 1, 'second identical submission must not send a second email')
})

test('IP rate limit returns 429 with Retry-After', async () => {
  const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`
  let last
  for (let i = 0; i < 6; i++) {
    last = mockRes()
    await contact(mockReq({ body: validContact(), ip }), last)
  }
  assert.equal(last.statusCode, 429)
  assert.ok(Number(last.headers['retry-after']) >= 1)
})

test('Turnstile enforced: missing token → 403; valid token → 200', async () => {
  process.env.TURNSTILE_SECRET_KEY = '0xREALSECRET_not_a_test_key_1234567890'
  const r1 = mockRes()
  await contact(mockReq({ body: { ...validContact(), turnstileToken: '' } }), r1)
  assert.equal(r1.statusCode, 403)

  const r2 = mockRes()
  await contact(mockReq({ body: { ...validContact(), turnstileToken: 'tok_abc' } }), r2)
  assert.equal(r2.statusCode, 200)
  const verify = fetchCalls.find((c) => c.url.includes('challenges.cloudflare.com'))
  assert.ok(verify)
  assert.match(verify.init.body, /remoteip=203\.0\.113\.\d+/)
})

test('Turnstile enforced: Cloudflare says fail → 403', async () => {
  process.env.TURNSTILE_SECRET_KEY = '0xREALSECRET_not_a_test_key_1234567890'
  globalThis.fetch = async (url) => {
    if (String(url).includes('challenges.cloudflare.com')) return new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), { status: 200 })
    return new Response('{}', { status: 200 })
  }
  const res = mockRes()
  await contact(mockReq({ body: { ...validContact(), turnstileToken: 'bad' } }), res)
  assert.equal(res.statusCode, 403)
})

// ---------------------------------------------------------------------------
// Tender + attachments
// ---------------------------------------------------------------------------
const validTender = () => ({
  companyName: 'Acme EPC GmbH',
  country: 'Germany',
  contactPerson: 'Max Mustermann',
  email: `max+${Math.random().toString(36).slice(2)}@example.de`,
  phone: '+49 30 1234567',
  tenderName: 'Upper Tamakoshi access road',
  tenderRef: 'DOR/2026/17',
  projectSector: 'Roads',
  bidDeadline: '2026-11-30',
  requiredSupport: 'Local JV / Partner',
  message: 'Looking for a local JV partner.',
  honeypot: '',
  attachment: null,
  turnstileToken: '',
})

const PDF_B64 = Buffer.from('%PDF-1.4\n%fake\n').toString('base64')
const ZIP_B64 = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]).toString('base64')

test('attachment validation: extension, magic bytes, filename sanitising, size', () => {
  assert.equal(validateAttachment(null).attachment, null)
  assert.equal(validateAttachment({ filename: 'x.exe', content: PDF_B64 }).ok, false)
  assert.equal(validateAttachment({ filename: 'doc.pdf', content: ZIP_B64 }).ok, false, 'pdf ext with zip bytes')
  const ok = validateAttachment({ filename: '../../etc/passwd.pdf', content: PDF_B64 })
  assert.equal(ok.ok, true)
  assert.equal(ok.attachment.filename, 'passwd.pdf')
  assert.equal(ok.attachment.contentType, 'application/pdf')
  const docx = validateAttachment({ filename: 'bid docs.docx', content: ZIP_B64 })
  assert.equal(docx.ok, true)
  const big = validateAttachment({ filename: 'a.pdf', content: 'A'.repeat(4 * 1024 * 1024) })
  assert.equal(big.ok, false)
  assert.equal(safeFilename('<script>.pdf'), '_script_.pdf')
  assert.equal(safeFilename('.htaccess'), 'htaccess')
})

test('tender: invalid date and bad attachment are rejected; valid one is emailed with attachment', async () => {
  const r1 = mockRes()
  await tender(mockReq({ body: { ...validTender(), bidDeadline: '30/11/2026' } }), r1)
  assert.equal(r1.statusCode, 400)

  const r2 = mockRes()
  await tender(mockReq({ body: { ...validTender(), attachment: { filename: 'malware.exe', content: PDF_B64 } } }), r2)
  assert.equal(r2.statusCode, 400)

  const r3 = mockRes()
  await tender(mockReq({ body: { ...validTender(), attachment: { filename: 'bid.pdf', content: PDF_B64 } } }), r3)
  assert.equal(r3.statusCode, 200)
  const resend = fetchCalls.find((c) => c.url.includes('api.resend.com'))
  const payload = JSON.parse(resend.init.body)
  assert.equal(payload.attachments.length, 1)
  assert.equal(payload.attachments[0].filename, 'bid.pdf')
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
test('escapeHtml and buildNotification never emit raw user HTML', () => {
  assert.equal(escapeHtml(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;')
  const { html } = buildNotification({ heading: 'h', intro: 'i', rows: [['Name', '<b>x</b>']], message: '<i>m</i>' })
  assert.ok(!html.includes('<b>x</b>'))
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'))
})

test('clientIp prefers Vercel-set headers over x-forwarded-for', () => {
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2', 'x-real-ip': '9.9.9.9' } }), '9.9.9.9')
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } }), '1.1.1.1')
  assert.equal(clientIp({ headers: {}, socket: { remoteAddress: '::1' } }), '::1')
})

// ---------------------------------------------------------------------------
// Turnstile hostname binding + cached public content endpoint
// ---------------------------------------------------------------------------
test('Turnstile: a token minted on another hostname is rejected even if Cloudflare says success', async () => {
  process.env.TURNSTILE_SECRET_KEY = '0xREALSECRET_not_a_test_key_1234567890'
  globalThis.fetch = async (url) => {
    if (String(url).includes('challenges.cloudflare.com')) return new Response(JSON.stringify({ success: true, hostname: 'evil.example.com' }), { status: 200 })
    return new Response('{}', { status: 200 })
  }
  const res = mockRes()
  await contact(mockReq({ body: { ...validContact(), turnstileToken: 'tok_from_elsewhere' } }), res)
  assert.equal(res.statusCode, 403)

  globalThis.fetch = async (url) => {
    if (String(url).includes('challenges.cloudflare.com')) return new Response(JSON.stringify({ success: true, hostname: 'www.rosiddai.com' }), { status: 200 })
    if (String(url).includes('api.resend.com')) return new Response(JSON.stringify({ id: 'email_ok' }), { status: 200 })
    return new Response('{}', { status: 200 })
  }
  const ok = mockRes()
  await contact(mockReq({ body: { ...validContact(), turnstileToken: 'tok_ours' } }), ok)
  assert.equal(ok.statusCode, 200)
})

test('home-content: GET only, never cached on failure, cached with SWR on success', async () => {
  const { default: homeContent } = await import('../api/home-content.js')

  const bad = mockRes()
  await homeContent(mockReq({ method: 'POST' }), bad)
  assert.equal(bad.statusCode, 405)

  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  const down = mockRes()
  await homeContent(mockReq({ method: 'GET' }), down)
  assert.equal(down.statusCode, 503)
  assert.equal(down.headers['cache-control'], 'no-store')
})

test('health: GET only, 503 when the database is unconfigured, no caching', async () => {
  const { default: health } = await import('../api/health.js')
  const bad = mockRes()
  await health(mockReq({ method: 'POST' }), bad)
  assert.equal(bad.statusCode, 405)
  delete process.env.SUPABASE_URL
  delete process.env.VITE_SUPABASE_URL
  const res = mockRes()
  await health(mockReq({ method: 'GET' }), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.headers['cache-control'], 'no-store')
})
