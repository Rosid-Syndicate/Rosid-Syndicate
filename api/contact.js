// POST /api/contact — public contact form.
// See api/_lib/inquiry.js for the control pipeline and API_SECURITY_MATRIX.md
// for the documented contract, limits and abuse controls.

import { handleInquiry } from './_lib/inquiry.js'
import { cleanEmail, cleanLine, cleanPhone, cleanText, looksLikeLinkSpam, oneOf } from './_lib/validate.js'

// Must match INQUIRY_TYPES in src/components/Contact.tsx
export const INQUIRY_TYPES = [
  'General Inquiry',
  'Infrastructure & Construction',
  'Tender / Procurement',
  'Foreign Contractor Support',
  'Financial Advisory',
  'Hydropower / Transmission',
  'Trade & Supply',
]

export const contactSpec = {
  name: 'contact',
  maxBodyBytes: 32 * 1024,
  allowedKeys: ['name', 'company', 'email', 'phone', 'inquiryType', 'message', 'honeypot', 'turnstileToken'],

  parse(body) {
    const name = cleanLine(body.name, 120)
    if (name.length < 2) return { ok: false, error: 'Please enter your name.' }

    const email = cleanEmail(body.email)
    if (!email) return { ok: false, error: 'Please enter a valid email address.' }

    const phone = cleanPhone(body.phone)
    if (phone === null) return { ok: false, error: 'Please enter a valid phone number.' }

    const company = cleanLine(body.company, 160)

    const inquiryType = body.inquiryType ? oneOf(body.inquiryType, INQUIRY_TYPES) : 'General Inquiry'
    if (!inquiryType) return { ok: false, error: 'Please choose a valid inquiry type.' }

    const message = cleanText(body.message, 5000)
    if (message.length < 10) return { ok: false, error: 'Please tell us a little more about your inquiry (at least 10 characters).' }
    if (looksLikeLinkSpam(message)) return { ok: false, error: 'Messages with many links are not accepted. Please describe your request in plain text.' }

    return { ok: true, data: { name, email, phone, company, inquiryType, message }, attachment: null }
  },

  toRow(d) {
    return {
      inquiry_type: d.inquiryType,
      name: d.name,
      company_name: d.company || null,
      email: d.email,
      phone: d.phone || null,
      subject: d.inquiryType,
      message: d.message,
      status: 'New',
    }
  },

  toEmail(d) {
    return {
      subject: `New inquiry: ${d.inquiryType} — ${d.name}`,
      heading: 'New website inquiry',
      intro: 'A visitor submitted the contact form on the corporate website.',
      rows: [
        ['Name', d.name],
        ['Company', d.company],
        ['Email', d.email],
        ['Phone', d.phone],
        ['Inquiry type', d.inquiryType],
      ],
      message: d.message,
    }
  },

  // Business flow: a genuine visitor sends one, occasionally two, messages.
  limits: [
    { name: 'ip-burst', limit: 5, windowSec: 60 * 60, key: ({ ip }) => `contact:ip:${ip}` },
    { name: 'ip-daily', limit: 15, windowSec: 24 * 60 * 60, key: ({ ip }) => `contact:ipd:${ip}` },
    { name: 'email-daily', limit: 5, windowSec: 24 * 60 * 60, key: ({ emailHash }) => `contact:em:${emailHash}` },
  ],
}

export default async function handler(req, res) {
  try {
    return await handleInquiry(req, res, contactSpec)
  } catch (error) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'contact.unhandled', error: String(error?.message || error) }))
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
}
