// Transactional email via Resend. All user-supplied values are HTML-escaped —
// the previous implementation interpolated raw form input into the admin
// notification, which allowed HTML/link injection into the admin's inbox.

const BRAND = {
  name: 'Rosid Syndicates Group',
  navy: '#011E52',
  orange: '#FD7B00',
  canvas: '#F4F4F2',
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function nl2br(escaped) {
  return escaped.replace(/\n/g, '<br/>')
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && (process.env.CONTACT_EMAIL || process.env.CONTACT_EMAIL_TO))
}

/**
 * Builds a compact, mobile-friendly notification. `rows` is an ordered list of
 * [label, value] pairs; `message` is rendered as a block. Everything is escaped.
 */
export function buildNotification({ heading, intro, rows, message, replyTo }) {
  const rowHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#475569;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;font-size:14px;vertical-align:top">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('')

  const html = `<!doctype html>
<html><body style="margin:0;background:${BRAND.canvas};font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px">
    <div style="background:${BRAND.navy};color:#fff;padding:16px 20px;border-top:4px solid ${BRAND.orange}">
      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.8">${escapeHtml(BRAND.name)} — Website</div>
      <h1 style="margin:6px 0 0;font-size:18px;font-weight:700">${escapeHtml(heading)}</h1>
    </div>
    <div style="background:#fff;padding:20px;border:1px solid #e5e7eb;border-top:0">
      <p style="margin:0 0 16px;font-size:14px;color:#334155">${escapeHtml(intro)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb">${rowHtml}</table>
      ${message ? `<h2 style="margin:20px 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#475569">Message</h2>
      <div style="padding:14px 16px;background:${BRAND.canvas};border-left:3px solid ${BRAND.orange};font-size:14px;line-height:1.6;white-space:normal">${nl2br(escapeHtml(message))}</div>` : ''}
      ${replyTo ? `<p style="margin:20px 0 0;font-size:12px;color:#64748b">Reply to this email to respond directly to ${escapeHtml(replyTo)}.</p>` : ''}
    </div>
  </div>
</body></html>`

  const text = [
    `${BRAND.name} — ${heading}`,
    '',
    intro,
    '',
    ...rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '').map(([l, v]) => `${l}: ${v}`),
    ...(message ? ['', 'Message:', message] : []),
  ].join('\n')

  return { html, text }
}

/**
 * Sends through Resend. Returns {sent: boolean, id?: string, error?: string}.
 * The sender address MUST belong to a domain verified in Resend; the default
 * `onboarding@resend.dev` only delivers to the Resend account owner.
 */
export async function sendNotification({ subject, html, text, replyTo, attachments }) {
  if (!isEmailConfigured()) return { sent: false, error: 'email-not-configured' }

  const from = process.env.CONTACT_EMAIL_FROM || 'Rosid Syndicates Group <onboarding@resend.dev>'
  const to = (process.env.CONTACT_EMAIL_TO || process.env.CONTACT_EMAIL)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const payload = { from, to, subject, html, text }
  if (replyTo) payload.reply_to = replyTo
  if (attachments && attachments.length) payload.attachments = attachments

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { sent: false, error: `resend ${res.status}: ${errText.slice(0, 200)}` }
    }
    const data = await res.json().catch(() => ({}))
    return { sent: true, id: data?.id }
  } catch (err) {
    return { sent: false, error: String(err?.message || err) }
  }
}
