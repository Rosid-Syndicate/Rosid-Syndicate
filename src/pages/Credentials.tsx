import { useEffect, useState } from 'react'
import { DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'

type Credential = {
  id: string
  title: string
  category: string
  description: string | null
  file_url: string
}

// Must match the category list in src/pages/admin/Credentials.tsx
const CATEGORIES = [
  'Company Registration',
  'PAN / VAT',
  'Contractor Registration',
  'Licences',
  'Certifications',
  'Banking / Financial Credentials',
  'Safety / Quality',
  'Other Corporate Documents',
]

/**
 * Public credentials list. Only rows with is_public = true are returned by RLS.
 * Documents open through the bucket's public URL (synchronous, so browsers do
 * not block the new tab as a pop-up — the previous async download + window.open
 * was blocked on Safari/mobile and used alert()).
 */
export default function Credentials() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('credentials')
      .select('id, title, category, description, file_url')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setState('error')
          return
        }
        setCredentials(data ?? [])
        setState('ready')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const publicUrl = (path: string) => supabase.storage.from('credentials_files').getPublicUrl(path).data.publicUrl

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Credentials & Compliance"
        description="Statutory registrations, PAN/VAT, contractor registrations, licences and certifications of Rosid Syndicates Group and its operating companies, published as they are cleared for release."
        path="/credentials"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Credentials & Compliance', path: '/credentials' }]}
      />
      <PageHeader
        title="Credentials & compliance"
        subtitle="Corporate governance"
        lead="Statutory documents for the group and its companies, published as they are cleared by the legal and compliance team."
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"
        compact
      />

      <section className="py-16 lg:py-24" aria-labelledby="creds-heading">
        <div className="container max-w-5xl">
          <h2 id="creds-heading" className="sr-only">Documents by category</h2>

          {state === 'loading' && (
            <p className="text-muted" role="status">Loading published documents…</p>
          )}
          {state === 'error' && (
            <p className="text-danger" role="alert">The document list could not be loaded right now. Please try again later or contact us for a copy.</p>
          )}

          {state === 'ready' && (
            <>
              {credentials.length === 0 && (
                <div className="mb-10 card p-6 max-w-3xl">
                  <p className="text-sm font-bold text-ink uppercase tracking-[0.08em]">Status: publication pending</p>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    Corporate credentials, statutory licences and registration certificates are published here once cleared by the legal and compliance division. Contact us if you need a document for a tender evaluation.
                  </p>
                </div>
              )}
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {CATEGORIES.map((category) => {
                  const docs = credentials.filter((c) => c.category === category)
                  return (
                    <li key={category} className="card p-6 flex flex-col">
                      <DocumentTextIcon className="w-6 h-6 text-accent-text mb-4" aria-hidden="true" />
                      <h3 className="font-bold text-ink">{category}</h3>
                      <div className="mt-4 pt-4 border-t border-line flex-1">
                        {docs.length === 0 ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">No documents published yet</p>
                        ) : (
                          <ul className="space-y-3">
                            {docs.map((cred) => (
                              <li key={cred.id}>
                                <a
                                  href={publicUrl(cred.file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-start justify-between gap-3 rounded-sm"
                                >
                                  <span>
                                    <span className="block text-sm font-semibold text-ink group-hover:text-accent-text">{cred.title}</span>
                                    {cred.description && <span className="block text-xs text-muted mt-0.5">{cred.description}</span>}
                                  </span>
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                                  <span className="sr-only">(opens in a new tab)</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
