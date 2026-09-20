// Client for the lead endpoints (/api/contact, /api/tender).
//
// The browser never writes to the `inquiries` table directly any more: every
// submission goes through the serverless API, which owns validation, honeypot
// handling, Turnstile verification, rate limiting and duplicate suppression.
// Previously both the browser AND the API inserted a row, creating duplicate
// leads and a path around every server-side control.

export class LeadSubmitError extends Error {
  status: number
  retryAfter?: number
  constructor(message: string, status: number, retryAfter?: number) {
    super(message)
    this.name = 'LeadSubmitError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

const DEV_HINT =
  'The API is not running. In local development start the app with `vercel dev` (or deploy a preview) to test form submissions.'

export async function submitLead(endpoint: '/api/contact' | '/api/tender', payload: Record<string, unknown>) {
  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new LeadSubmitError(import.meta.env.DEV ? DEV_HINT : 'Network error. Please check your connection and try again.', 0)
  }

  // Vite's dev server answers unknown routes with the SPA shell (HTML, 200).
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new LeadSubmitError(import.meta.env.DEV ? DEV_HINT : 'Unexpected response from the server. Please try again.', res.status)
  }

  const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; message?: string }
  if (!res.ok || !data.success) {
    const retryAfter = Number(res.headers.get('retry-after') || 0) || undefined
    throw new LeadSubmitError(data.error || 'Submission failed. Please try again.', res.status, retryAfter)
  }
  return data
}
