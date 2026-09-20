// Input validation helpers. Every public field passes through here.

// Practical email check (RFC 5322 is intentionally not fully implemented):
// one @, no whitespace, dotted domain, sane length.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/

// C0 control characters except TAB (9), LF (10) and CR (13), plus DEL (127).
const cc = (n) => String.fromCharCode(n)
const CONTROL_CHARS = new RegExp(`[${cc(0)}-${cc(8)}${cc(11)}${cc(12)}${cc(14)}-${cc(31)}${cc(127)}]`, 'g')

// Removes control characters (except \n and \t) that have no place in form
// input and can break email clients / logs.
export function cleanText(value, max) {
  if (value === undefined || value === null) return ''
  let s = String(value)
  s = s.replace(CONTROL_CHARS, '')
  s = s.replace(/\r\n?/g, '\n').trim()
  if (s.length > max) s = s.slice(0, max)
  return s
}

/** Single-line text: collapses newlines too (names, subjects, phone…). */
export function cleanLine(value, max) {
  return cleanText(value, max).replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ')
}

export function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value)
}

export function cleanEmail(value) {
  const s = cleanLine(value, 254).toLowerCase()
  return isEmail(s) ? s : null
}

/** Phone: digits, spaces, + ( ) - . only; optional field. */
export function cleanPhone(value) {
  const s = cleanLine(value, 40)
  if (!s) return ''
  if (!/^[0-9+()\-.\s]{5,40}$/.test(s)) return null
  return s
}

/** Enum: returns the canonical value or null. */
export function oneOf(value, allowed) {
  if (typeof value !== 'string') return null
  const s = value.trim()
  return allowed.includes(s) ? s : null
}

/** ISO date (YYYY-MM-DD) that parses; optional field. */
export function cleanDate(value) {
  const s = cleanLine(value, 10)
  if (!s) return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(`${s}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : s
}

/**
 * Detects the most common spam payloads: many URLs, or the same URL repeated.
 * We do not block on a single link — legitimate tender messages contain one.
 */
export function looksLikeLinkSpam(text) {
  const links = (String(text).match(/https?:\/\/|www\./gi) || []).length
  return links >= 4
}

/** Rejects payloads with unexpected keys (mass-assignment guard). */
export function unexpectedKeys(body, allowed) {
  if (!body || typeof body !== 'object') return []
  return Object.keys(body).filter((k) => !allowed.includes(k))
}
