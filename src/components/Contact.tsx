import { useId, useRef, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { CONTACT } from '../config/site'
import { LeadSubmitError, submitLead } from '../lib/leads'
import { trackEvent } from '../utils/analytics'

// Must match INQUIRY_TYPES in api/contact.js
const INQUIRY_TYPES = [
  'General Inquiry',
  'Infrastructure & Construction',
  'Tender / Procurement',
  'Foreign Contractor Support',
  'Financial Advisory',
  'Hydropower / Transmission',
  'Trade & Supply',
]

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

const EMPTY = { name: '', company: '', email: '', phone: '', inquiryType: '', message: '', honeypot: '' }

const fieldClass =
  'w-full bg-canvas border border-line rounded-sm px-4 py-3 text-ink placeholder:text-slate-400 focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/20 transition-colors duration-fast aria-[invalid=true]:border-danger'
const labelClass = 'block text-xs font-bold text-muted uppercase tracking-[0.08em] mb-2'

export default function Contact() {
  const [formData, setFormData] = useState(EMPTY)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const errorId = useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formData.name.trim() || !formData.email.trim() || !formData.inquiryType || formData.message.trim().length < 10) {
      setErrorMessage('Please complete the required fields. Your message should be at least 10 characters.')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await submitLead('/api/contact', { ...formData, turnstileToken })
      setStatus('success')
      toast.success('Message sent. We will reply shortly.')
      trackEvent('lead_submitted', { form: 'contact', inquiry_type: formData.inquiryType })
      setFormData(EMPTY)
      setTurnstileToken('')
      turnstileRef.current?.reset()
      window.setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      const e = err as LeadSubmitError
      const message =
        e.status === 429 && e.retryAfter
          ? `Too many submissions from this connection. Please try again in about ${Math.ceil(e.retryAfter / 60)} minute(s).`
          : e.message
      setErrorMessage(message)
      setStatus('error')
      trackEvent('lead_failed', { form: 'contact', status: e.status })
      turnstileRef.current?.reset()
    }
  }

  const disabled = status === 'loading' || status === 'success'

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-ink text-white" aria-labelledby="contact-heading">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12 lg:gap-20">
          <div>
            <p className="eyebrow text-accent">Contact</p>
            <h2 id="contact-heading" className="mt-5 text-h2 text-white">
              Talk to our team.
            </h2>
            <p className="mt-5 text-base text-slate-300 leading-relaxed max-w-md">
              Tell us about your project, tender or supply requirement. A member of the relevant division replies by email — usually within two working days.
            </p>

            <dl className="mt-12 pt-8 border-t border-white/10 space-y-6 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-[0.08em]">Head office</dt>
                <dd className="mt-1 text-white/90">{CONTACT.addressLine}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-[0.08em]">Phone</dt>
                <dd className="mt-1">
                  <a href={CONTACT.phoneHref} className="text-white/90 hover:text-accent underline-offset-4 hover:underline">
                    {CONTACT.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-[0.08em]">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${CONTACT.email}`} className="text-white/90 hover:text-accent underline-offset-4 hover:underline break-all">
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <form onSubmit={submit} noValidate className="bg-surface text-ink p-6 sm:p-10 rounded-sm shadow-raised" aria-describedby={errorMessage ? errorId : undefined}>
            {/* Honeypot — hidden from people, filled by naive bots. Never remove aria-hidden/tabIndex. */}
            <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
              <label htmlFor="contact-honeypot">Leave this field empty</label>
              <input id="contact-honeypot" name="honeypot" type="text" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={handleChange} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Name <span aria-hidden="true" className="text-accent-text">*</span>
                </label>
                <input id="contact-name" name="name" type="text" required maxLength={120} autoComplete="name" value={formData.name} onChange={handleChange} className={fieldClass} placeholder="Full name" />
              </div>
              <div>
                <label htmlFor="contact-company" className={labelClass}>Company</label>
                <input id="contact-company" name="company" type="text" maxLength={160} autoComplete="organization" value={formData.company} onChange={handleChange} className={fieldClass} placeholder="Organisation" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Email <span aria-hidden="true" className="text-accent-text">*</span>
                </label>
                <input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} className={fieldClass} placeholder="you@company.com" />
              </div>
              <div>
                <label htmlFor="contact-phone" className={labelClass}>Phone</label>
                <input id="contact-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" inputMode="tel" value={formData.phone} onChange={handleChange} className={fieldClass} placeholder="+977 …" />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="contact-inquiryType" className={labelClass}>
                Inquiry type <span aria-hidden="true" className="text-accent-text">*</span>
              </label>
              <select id="contact-inquiryType" name="inquiryType" required value={formData.inquiryType} onChange={handleChange} className={`${fieldClass} cursor-pointer`}>
                <option value="" disabled>Select an area</option>
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label htmlFor="contact-message" className={labelClass}>
                Message <span aria-hidden="true" className="text-accent-text">*</span>
              </label>
              <textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={5000} value={formData.message} onChange={handleChange} placeholder="Project, tender reference, quantities, timeline…" className={`${fieldClass} resize-y min-h-[8rem]`} />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
              <div className="turnstile-slot">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>
              <button
                type="submit"
                disabled={disabled}
                className="btn-primary w-full sm:w-auto shrink-0 whitespace-nowrap"
                aria-busy={status === 'loading'}
              >
                {status === 'loading' ? 'Sending…' : status === 'success' ? 'Sent' : 'Send message'}
              </button>
            </div>

            <div className="min-h-[1.5rem] mt-4" aria-live="polite">
              {errorMessage && (
                <p id={errorId} role="alert" className="text-sm text-danger font-medium">
                  {errorMessage}
                </p>
              )}
              {status === 'success' && (
                <p className="text-sm text-success font-medium">Thank you — your message has been received.</p>
              )}
            </div>

            <p className="mt-2 text-xs text-muted">
              Protected by Cloudflare Turnstile. We only use your details to respond to this inquiry — see our{' '}
              <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ink">privacy policy</a>.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
