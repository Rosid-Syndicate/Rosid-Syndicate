import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowPathIcon, DocumentPlusIcon, InboxIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { StatusBadge } from './Inquiries'

interface InquiryItem {
  id: string
  name: string
  company_name: string | null
  email: string
  subject: string | null
  message: string
  inquiry_type: string
  status: string
  created_at: string
}

type Counts = {
  total: number
  new: number
  read: number
  contacted: number
  closed: number
  companies: number
  posts: number
  drafts: number
  categories: number
  credentials: number
}

const EMPTY: Counts = { total: 0, new: 0, read: 0, contacted: 0, closed: 0, companies: 0, posts: 0, drafts: 0, categories: 0, credentials: 0 }

// Head-only count queries: no rows are transferred (the previous dashboard
// downloaded every inquiry row to compute four numbers).
const HEAD = { count: 'exact' as const, head: true }
function n(r: { count: number | null; error: { message: string } | null }) {
  if (r.error) throw r.error
  return r.count ?? 0
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>(EMPTY)
  const [recent, setRecent] = useState<InquiryItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const [rTotal, rNew, rRead, rContacted, rClosed, rCompanies, rPosts, rDrafts, rCategories, rCredentials, recentRes] = await Promise.all([
        supabase.from('inquiries').select('*', HEAD),
        supabase.from('inquiries').select('*', HEAD).eq('status', 'New'),
        supabase.from('inquiries').select('*', HEAD).eq('status', 'Read'),
        supabase.from('inquiries').select('*', HEAD).eq('status', 'Contacted'),
        supabase.from('inquiries').select('*', HEAD).eq('status', 'Closed'),
        supabase.from('companies').select('*', HEAD).eq('is_archived', false),
        supabase.from('blog_posts').select('*', HEAD).eq('is_published', true),
        supabase.from('blog_posts').select('*', HEAD).eq('is_published', false),
        supabase.from('blog_categories').select('*', HEAD),
        supabase.from('credentials').select('*', HEAD),
        supabase
          .from('inquiries')
          .select('id, name, company_name, email, subject, message, inquiry_type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ])
      if (recentRes.error) throw recentRes.error
      const [total, nw, rd, ct, cl, companies, posts, drafts, categories, credentials] = [rTotal, rNew, rRead, rContacted, rClosed, rCompanies, rPosts, rDrafts, rCategories, rCredentials].map(n)
      const recentRows = recentRes.data
      setCounts({ total, new: nw, read: rd, contacted: ct, closed: cl, companies, posts, drafts, categories, credentials })
      setRecent((recentRows ?? []) as InquiryItem[])
      setState('ready')
      if (manual) toast.success('Dashboard refreshed')
    } catch (err) {
      console.warn('Dashboard load failed:', err)
      setErrorDetail(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err))
      setState('error')
      if (manual) toast.error('Could not refresh the dashboard')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const inquiryCards = [
    { label: 'New', value: counts.new, to: '/admin/inquiries?status=New', tone: 'text-warning' },
    { label: 'Read', value: counts.read, to: '/admin/inquiries?status=Read', tone: 'text-ink' },
    { label: 'Contacted', value: counts.contacted, to: '/admin/inquiries?status=Contacted', tone: 'text-info' },
    { label: 'Closed', value: counts.closed, to: '/admin/inquiries?status=Closed', tone: 'text-success' },
  ]

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => load(true)} disabled={refreshing} className="btn-secondary btn-sm" aria-busy={refreshing}>
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
          </button>
          <Link to="/admin/blog/create" className="btn-primary btn-sm">
            <DocumentPlusIcon className="w-4 h-4" aria-hidden="true" /> New post
          </Link>
        </div>
      </header>

      {state === 'error' && (
        <div role="alert" className="card border-l-4 border-l-danger p-4 text-sm text-danger space-y-1">
          <p>The dashboard could not load data — check your connection, and if you were recently added as an admin, make sure your account is in the <code>admin_users</code> table.</p>
          {errorDetail && <p className="text-xs text-muted font-mono break-all">{errorDetail}</p>}
        </div>
      )}

      {/* Inquiry pipeline — the numbers an operator acts on */}
      <section aria-labelledby="pipeline-heading">
        <div className="flex items-baseline justify-between mb-3">
          <h2 id="pipeline-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Inquiry pipeline · {counts.total} total</h2>
          <Link to="/admin/inquiries" className="link-arrow text-xs">Manage inquiries <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden="true" /></Link>
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {inquiryCards.map((c) => (
            <li key={c.label}>
              <Link to={c.to} className="card card-hover block p-5">
                <span className="block text-xs font-bold uppercase tracking-[0.1em] text-muted">{c.label}</span>
                <span className={`block mt-2 text-3xl font-bold tabular-nums ${c.tone}`}>{state === 'loading' ? '–' : c.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent inquiries */}
        <section className="lg:col-span-2 card overflow-hidden" aria-labelledby="recent-heading">
          <div className="p-5 border-b border-line flex items-center justify-between">
            <h2 id="recent-heading" className="text-h3 text-ink">Recent inquiries</h2>
            <Link to="/admin/inquiries" className="btn-ghost btn-sm">View all</Link>
          </div>
          {state === 'loading' ? (
            <p className="p-8 text-sm text-muted" role="status">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center">
              <InboxIcon className="w-8 h-8 text-muted mx-auto" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-ink">No inquiries yet</p>
              <p className="mt-1 text-xs text-muted">Submissions from the contact and tender forms appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas text-xs font-bold uppercase tracking-[0.08em] text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">Contact</th>
                    <th scope="col" className="px-5 py-3">Type</th>
                    <th scope="col" className="px-5 py-3">Subject</th>
                    <th scope="col" className="px-5 py-3">Date</th>
                    <th scope="col" className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recent.map((inq) => (
                    <tr key={inq.id} className="hover:bg-canvas/60">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-ink">{inq.name}</div>
                        <div className="text-xs text-muted">{inq.company_name || inq.email}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">{inq.inquiry_type}</td>
                      <td className="px-5 py-3 max-w-[16rem] truncate text-muted" title={inq.subject || inq.message}>{inq.subject || inq.message}</td>
                      <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">
                        <time dateTime={inq.created_at}>{new Date(inq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time>
                      </td>
                      <td className="px-5 py-3 text-right"><StatusBadge status={inq.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Content overview */}
        <section className="card p-5" aria-labelledby="content-heading">
          <h2 id="content-heading" className="text-h3 text-ink pb-4 border-b border-line">Content</h2>
          <dl className="mt-4 divide-y divide-line">
            {[
              { k: 'Published posts', v: counts.posts, to: '/admin/blog' },
              { k: 'Draft posts', v: counts.drafts, to: '/admin/blog' },
              { k: 'Categories', v: counts.categories, to: '/admin/categories' },
              { k: 'Active companies', v: counts.companies, to: '/admin/companies' },
              { k: 'Credential documents', v: counts.credentials, to: '/admin/credentials' },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between py-3">
                <dt className="text-sm text-muted"><Link to={row.to} className="hover:text-ink">{row.k}</Link></dt>
                <dd className="text-base font-bold text-ink tabular-nums">{state === 'loading' ? '–' : row.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted leading-relaxed">
            Note: the public site currently reads companies and mission/vision copy from bundled data, not from these tables. See WEBSITE_AUDIT.md (product decisions).
          </p>
        </section>
      </div>
    </div>
  )
}
