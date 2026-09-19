import { useId, useRef, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import { LeadSubmitError, submitLead } from '../lib/leads'
import { trackEvent } from '../utils/analytics'

// Must match SUPPORT_OPTIONS in api/tender.js
const SUPPORT_OPTIONS = [
  'Financial / Guarantee Support',
  'Local JV / Partner',
  'Procurement Support',
  'Material Supply',
  'Civil Execution',
  'Foreign Contractor Support',
  'Financial Closure',
  'Other',
]

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
const MAX_FILE_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

type Attachment = { filename: string; content: string }

const EMPTY = {
  companyName: '',
  country: '',
  contactPerson: '',
  email: '',
  phone: '',
  tenderName: '',
  tenderRef: '',
  projectSector: '',
  bidDeadline: '',
  requiredSupport: '',
  message: '',
  honeypot: '',
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span aria-hidden="true" className="text-accent-text">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function TenderInquiry() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const errorId = useId()

  const [formData, setFormData] = useState(EMPTY)
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = ACCEPTED_TYPES[file.type]
    const nameExt = file.name.split('.').pop()?.toLowerCase()
    if (!ext || ext !== nameExt) {
      toast.error('Only PDF, DOCX and XLSX files are accepted.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error('The file exceeds the 2 MB limit.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = String(reader.result).split(',')[1] || ''
      setAttachment({ filename: file.name, content: base64 })
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!formData.companyName.trim() || !formData.country.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      setErrorMessage('Please complete the required company and contact fields.')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await submitLead('/api/tender', { ...formData, attachment, turnstileToken })
      setStatus('success')
      toast.success('Tender inquiry received. We will be in touch.')
      trackEvent('lead_submitted', { form: 'tender', support: formData.requiredSupport || 'unspecified' })
      setFormData(EMPTY)
      removeFile()
      setTurnstileToken('')
      turnstileRef.current?.reset()
      window.setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      const e = err as LeadSubmitError
      setErrorMessage(
        e.status === 429 && e.retryAfter
          ? `Too many submissions from this connection. Please try again in about ${Math.ceil(e.retryAfter / 60)} minute(s).`
          : e.message
      )
      setStatus('error')
      trackEvent('lead_failed', { form: 'tender', status: e.status })
      turnstileRef.current?.reset()
    }
  }

  const disabled = status === 'loading' || status === 'success'

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Tender & RFQ Inquiry"
        description="Submit a tender or RFQ inquiry to Rosid Syndicates Group: local JV partnership, bank guarantee support, material supply, procurement and civil execution in Nepal. PDF, DOCX or XLSX documents up to 2 MB."
        path="/tender-inquiry"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Tender & RFQ Inquiry', path: '/tender-inquiry' }]}
      />
      <PageHeader
        title="Tender & RFQ inquiry"
        subtitle="Procurement desk"
        image="https://images.unsplash.com/photo-1574320297042-63bc58baf00c"
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl">
          <div className="mb-10 p-5 card flex gap-4">
            <PaperClipIcon className="w-5 h-5 text-accent-text shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-muted leading-relaxed">
              Share the tender reference, scope and deadline; attach the notice or BoQ if you have it (PDF, DOCX or XLSX up to 2 MB). Submissions go directly to the procurement desk and are not published.
            </p>
          </div>

          <form onSubmit={submit} noValidate className="space-y-12" aria-describedby={errorMessage ? errorId : undefined}>
            <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
              <label htmlFor="tender-honeypot">Leave this field empty</label>
              <input id="tender-honeypot" name="honeypot" type="text" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={handleChange} />
            </div>

            <fieldset className="card p-6 sm:p-8">
              <legend className="text-h3 text-ink px-1">1. Company &amp; contact</legend>
              <div className="grid sm:grid-cols-2 gap-5 mt-6">
                <Field id="companyName" label="Company name" required>
                  <input id="companyName" name="companyName" type="text" required maxLength={160} autoComplete="organization" value={formData.companyName} onChange={handleChange} className="field" />
                </Field>
                <Field id="country" label="Country" required>
                  <input id="country" name="country" type="text" required maxLength={80} autoComplete="country-name" value={formData.country} onChange={handleChange} className="field" />
                </Field>
                <Field id="contactPerson" label="Contact person" required>
                  <input id="contactPerson" name="contactPerson" type="text" required maxLength={120} autoComplete="name" value={formData.contactPerson} onChange={handleChange} className="field" />
                </Field>
                <Field id="email" label="Email" required>
                  <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange} className="field" />
                </Field>
                <Field id="phone" label="Phone">
                  <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" inputMode="tel" value={formData.phone} onChange={handleChange} className="field" />
                </Field>
              </div>
            </fieldset>

            <fieldset className="card p-6 sm:p-8">
              <legend className="text-h3 text-ink px-1">2. Tender / RFQ details</legend>
              <div className="grid sm:grid-cols-2 gap-5 mt-6">
                <Field id="tenderName" label="Tender / project name">
                  <input id="tenderName" name="tenderName" type="text" maxLength={200} value={formData.tenderName} onChange={handleChange} className="field" />
                </Field>
                <Field id="tenderRef" label="Tender reference (if any)">
                  <input id="tenderRef" name="tenderRef" type="text" maxLength={100} value={formData.tenderRef} onChange={handleChange} className="field" />
                </Field>
                <Field id="projectSector" label="Project sector">
                  <input id="projectSector" name="projectSector" type="text" maxLength={100} value={formData.projectSector} onChange={handleChange} className="field" placeholder="Roads, hydropower, transmission…" />
                </Field>
                <Field id="bidDeadline" label="Bid deadline">
                  <input id="bidDeadline" name="bidDeadline" type="date" value={formData.bidDeadline} onChange={handleChange} className="field" />
                </Field>
              </div>
              <div className="mt-5">
                <Field id="requiredSupport" label="Required support">
                  <select id="requiredSupport" name="requiredSupport" value={formData.requiredSupport} onChange={handleChange} className="field cursor-pointer">
                    <option value="">Select an option</option>
                    {SUPPORT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-5">
                <Field id="message" label="Message / scope description">
                  <textarea id="message" name="message" rows={5} maxLength={5000} value={formData.message} onChange={handleChange} className="field resize-y min-h-[8rem]" />
                </Field>
              </div>
            </fieldset>

            <fieldset className="card p-6 sm:p-8">
              <legend className="text-h3 text-ink px-1">3. Supporting document (optional)</legend>
              <div className="mt-6">
                {!attachment ? (
                  <label htmlFor="tender-file" className="block border-2 border-dashed border-line rounded-sm p-8 text-center hover:border-ink/40 focus-within:border-ink transition-colors cursor-pointer">
                    <input
                      id="tender-file"
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="sr-only"
                    />
                    <PaperClipIcon className="w-7 h-7 text-muted mx-auto mb-3" aria-hidden="true" />
                    <span className="block text-sm font-bold text-ink">Choose a file</span>
                    <span className="block text-xs text-muted mt-1">PDF, DOCX or XLSX · up to 2 MB</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-4 p-4 bg-canvas border border-line rounded-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <PaperClipIcon className="w-5 h-5 text-accent-text shrink-0" aria-hidden="true" />
                      <span className="text-sm font-bold text-ink truncate">{attachment.filename}</span>
                    </div>
                    <button type="button" onClick={removeFile} className="btn-ghost btn-sm" aria-label={`Remove ${attachment.filename}`}>
                      <XMarkIcon className="w-4 h-4" aria-hidden="true" /> Remove
                    </button>
                  </div>
                )}
              </div>
            </fieldset>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
              <div className="turnstile-slot">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>
              <button type="submit" disabled={disabled} className="btn-primary w-full sm:w-auto shrink-0 whitespace-nowrap" aria-busy={status === 'loading'}>
                {status === 'loading' ? 'Submitting…' : status === 'success' ? 'Inquiry sent' : 'Submit inquiry'}
              </button>
            </div>

            <div className="min-h-[1.5rem]" aria-live="polite">
              {errorMessage && (
                <p id={errorId} role="alert" className="text-sm text-danger font-medium">{errorMessage}</p>
              )}
              {status === 'success' && (
                <p className="text-sm text-success font-medium">Thank you — your inquiry has been received by the procurement desk.</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
