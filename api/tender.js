// POST /api/tender — tender / RFQ inquiry with optional document attachment.
// See api/_lib/inquiry.js for the control pipeline and API_SECURITY_MATRIX.md
// for the documented contract, limits and abuse controls.

import { handleInquiry } from './_lib/inquiry.js'
import { validateAttachment, MAX_ATTACHMENT_BYTES } from './_lib/attachments.js'
import { cleanDate, cleanEmail, cleanLine, cleanPhone, cleanText, looksLikeLinkSpam, oneOf } from './_lib/validate.js'

// Must match SUPPORT_OPTIONS in src/pages/TenderInquiry.tsx
export const SUPPORT_OPTIONS = [
  'Financial / Guarantee Support',
  'Local JV / Partner',
  'Procurement Support',
  'Material Supply',
  'Civil Execution',
  'Foreign Contractor Support',
  'Financial Closure',
  'Other',
]

export const tenderSpec = {
  name: 'tender',
  // base64 attachment (2 MB → ~2.7 MB) + form fields
  maxBodyBytes: Math.ceil(MAX_ATTACHMENT_BYTES * 1.4) + 64 * 1024,
  allowedKeys: [
    'companyName', 'country', 'contactPerson', 'email', 'phone',
    'tenderName', 'tenderRef', 'projectSector', 'bidDeadline',
    'requiredSupport', 'message', 'honeypot', 'attachment', 'turnstileToken',
  ],

  parse(body) {
    const companyName = cleanLine(body.companyName, 160)
    if (companyName.length < 2) return { ok: false, error: 'Please enter your company name.' }

    const contactPerson = cleanLine(body.contactPerson, 120)
    if (contactPerson.length < 2) return { ok: false, error: 'Please enter a contact person.' }

    const email = cleanEmail(body.email)
    if (!email) return { ok: false, error: 'Please enter a valid email address.' }

    const phone = cleanPhone(body.phone)
    if (phone === null) return { ok: false, error: 'Please enter a valid phone number.' }

    const country = cleanLine(body.country, 80)
    if (country.length < 2) return { ok: false, error: 'Please enter your country.' }

    const tenderName = cleanLine(body.tenderName, 200)
    const tenderRef = cleanLine(body.tenderRef, 100)
    const projectSector = cleanLine(body.projectSector, 100)

    const bidDeadline = cleanDate(body.bidDeadline)
    if (bidDeadline === null) return { ok: false, error: 'Bid deadline must be a valid date (YYYY-MM-DD).' }

    const requiredSupport = body.requiredSupport ? oneOf(body.requiredSupport, SUPPORT_OPTIONS) : ''
    if (requiredSupport === null) return { ok: false, error: 'Please choose a valid support option.' }

    const message = cleanText(body.message, 5000)
    if (looksLikeLinkSpam(message)) return { ok: false, error: 'Messages with many links are not accepted. Please describe your request in plain text.' }

    const att = validateAttachment(body.attachment)
    if (!att.ok) return { ok: false, error: att.error }

    return {
      ok: true,
      data: { companyName, contactPerson, email, phone, country, tenderName, tenderRef, projectSector, bidDeadline, requiredSupport, message },
      attachment: att.attachment,
    }
  },

  toRow(d) {
    return {
      inquiry_type: 'Tender / RFQ Inquiry',
      name: d.contactPerson,
      company_name: d.companyName,
      email: d.email,
      phone: d.phone || null,
      subject: d.tenderName || `Tender: ${d.companyName}`,
      message: [
        `Country: ${d.country}`,
        `Tender Ref: ${d.tenderRef || 'N/A'}`,
        `Project Sector: ${d.projectSector || 'N/A'}`,
        `Bid Deadline: ${d.bidDeadline || 'N/A'}`,
        `Required Support: ${d.requiredSupport || 'N/A'}`,
        '',
        'Message:',
        d.message || 'N/A',
      ].join('\n'),
      status: 'New',
    }
  },

  toEmail(d) {
    return {
      subject: `New tender inquiry: ${d.companyName}${d.tenderName ? ` — ${d.tenderName}` : ''}`,
      heading: 'New tender / RFQ inquiry',
      intro: 'A prospective partner submitted the tender inquiry form on the corporate website.',
      rows: [
        ['Company', d.companyName],
        ['Country', d.country],
        ['Contact person', d.contactPerson],
        ['Email', d.email],
        ['Phone', d.phone],
        ['Tender / project', d.tenderName],
        ['Tender reference', d.tenderRef],
        ['Project sector', d.projectSector],
        ['Bid deadline', d.bidDeadline],
        ['Required support', d.requiredSupport],
      ],
      message: d.message || 'No additional message.',
    }
  },

  // Tender submissions are rarer and heavier (attachments) than contact messages.
  limits: [
    { name: 'ip-burst', limit: 3, windowSec: 60 * 60, key: ({ ip }) => `tender:ip:${ip}` },
    { name: 'ip-daily', limit: 8, windowSec: 24 * 60 * 60, key: ({ ip }) => `tender:ipd:${ip}` },
    { name: 'email-daily', limit: 4, windowSec: 24 * 60 * 60, key: ({ emailHash }) => `tender:em:${emailHash}` },
  ],
}

export default async function handler(req, res) {
  try {
    return await handleInquiry(req, res, tenderSpec)
  } catch (error) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'tender.unhandled', error: String(error?.message || error) }))
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
}
