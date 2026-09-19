import { useCallback, useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PhoneIcon, BuildingOffice2Icon, TrashIcon, ArrowPathIcon, MagnifyingGlassIcon, InboxIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useConfirm } from '../../components/ConfirmDialog'

type Inquiry = {
  id: string
  inquiry_type: string
  name: string
  company_name: string | null
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  created_at: string
}

export const STATUSES = ['New', 'Read', 'Contacted', 'Closed'] as const
type Status = (typeof STATUSES)[number]

const TONE: Record<string, string> = {
  New: 'bg-warning-soft text-warning border-warning/30',
  Read: 'bg-canvas text-ink border-line',
  Contacted: 'bg-info-soft text-info border-info/30',
  Closed: 'bg-success-soft text-success border-success/30',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] rounded-sm border ${TONE[status] ?? TONE.Read}`}>
      {status}
    </span>
  )
}

/**
 * Inquiry management. Status changes and deletions now report the real result:
 * the previous version applied optimistic state and showed a success toast even
 * when Supabase returned an error.
 */
export default function Inquiries() {
  const confirm = useConfirm()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [params, setParams] = useSearchParams()
  const filterStatus = params.get('status') ?? 'all'
  const searchId = useId()

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, inquiry_type, name, company_name, email, phone, subject, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) {
      setState('error')
      if (manual) toast.error(`Could not load inquiries: ${error.message}`)
    } else {
      setInquiries((data ?? []) as Inquiry[])
      setState('ready')
      if (manual) toast.success(`Loaded ${data?.length ?? 0} inquiries`)
    }
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, newStatus: Status) => {
    const previous = inquiries
    setInquiries((list) => list.map((i) => (i.id === id ? { ...i, status: newStatus } : i)))
    const { error } = await supabase.from('inquiries').update({ status: newStatus }).eq('id', id)
    if (error) {
      setInquiries(previous)
      toast.error(`Status not saved: ${error.message}`)
      return
    }
    toast.success(`Marked as ${newStatus}`)
  }

  const deleteInquiry = async (inq: Inquiry) => {
    const ok = await confirm({ title: `Delete the inquiry from "${inq.name}"?`, description: 'Consider marking it Closed instead — deletion cannot be undone.', confirmLabel: 'Delete inquiry', tone: 'danger' })
    if (!ok) return
    const { error } = await supabase.from('inquiries').delete().eq('id', inq.id)
    if (error) {
      toast.error(`Delete failed: ${error.message}`)
      return
    }
    setInquiries((list) => list.filter((i) => i.id !== inq.id))
    toast.success('Inquiry deleted')
  }

  const q = search.trim().toLowerCase()
  const filtered = inquiries.filter((i) => {
    const matchesSearch =
      !q || [i.name, i.company_name, i.email, i.subject, i.message].some((v) => (v || '').toLowerCase().includes(q))
    const matchesStatus = filterStatus === 'all' || (i.status || '').toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  /** CSV of the currently filtered rows (built in the browser; nothing is sent anywhere). */
  const exportCsv = () => {
    const esc = (v: string | null) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Received', 'Status', 'Type', 'Name', 'Company', 'Email', 'Phone', 'Subject', 'Message']
    const lines = filtered.map((i) => [i.created_at, i.status, i.inquiry_type, i.name, i.company_name, i.email, i.phone, i.subject, i.message].map(esc).join(','))
    const blob = new Blob(['﻿' + [header.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `inquiries-${filterStatus}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const setFilter = (st: string) => {
    const next = new URLSearchParams(params)
    if (st === 'all') next.delete('status')
    else next.set('status', st)
    setParams(next, { replace: true })
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Inquiries</h1>
          <p className="mt-1 text-sm text-muted">Contact messages and tender / RFQ submissions from the website.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary btn-sm">
            <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" /> Export CSV ({filtered.length})
          </button>
          <button type="button" onClick={() => load(true)} disabled={refreshing} className="btn-secondary btn-sm" aria-busy={refreshing}>
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
          </button>
        </div>
      </header>

      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((st) => {
            const count = st === 'all' ? inquiries.length : inquiries.filter((i) => (i.status || '').toLowerCase() === st.toLowerCase()).length
            const active = filterStatus.toLowerCase() === st.toLowerCase()
            return (
              <button key={st} type="button" onClick={() => setFilter(st)} aria-pressed={active} className={`btn btn-sm ${active ? 'bg-ink text-white' : 'bg-canvas text-ink hover:bg-line'}`}>
                {st === 'all' ? 'All' : st} <span className="tabular-nums opacity-70">({count})</span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full md:w-80">
          <label htmlFor={searchId} className="sr-only">Search inquiries</label>
          <MagnifyingGlassIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input id={searchId} type="search" placeholder="Search name, company, email, message…" value={search} onChange={(e) => setSearch(e.target.value)} className="field pl-9 py-2 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {state === 'loading' ? (
          <p className="p-10 text-sm text-muted" role="status">Loading inquiries…</p>
        ) : state === 'error' ? (
          <p className="p-10 text-sm text-danger" role="alert">Inquiries could not be loaded. Check your admin access and try again.</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <InboxIcon className="w-8 h-8 text-muted mx-auto" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-ink">No inquiries found</p>
            <p className="mt-1 text-xs text-muted">{q || filterStatus !== 'all' ? 'Nothing matches the current search or filter.' : 'New submissions will appear here.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Inquiries ({filtered.length})</caption>
              <thead className="bg-canvas text-xs font-bold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Contact</th>
                  <th scope="col" className="px-5 py-3">Type</th>
                  <th scope="col" className="px-5 py-3">Message</th>
                  <th scope="col" className="px-5 py-3">Received</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-canvas/60">
                    <td className="px-5 py-4 min-w-[14rem]">
                      <div className="font-semibold text-ink">{req.name}</div>
                      <a href={`mailto:${req.email}`} className="block text-xs text-muted hover:text-ink break-all">{req.email}</a>
                      {req.phone && (
                        <a href={`tel:${req.phone.replace(/[^\d+]/g, '')}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                          <PhoneIcon className="w-3 h-3" aria-hidden="true" /> {req.phone}
                        </a>
                      )}
                      {req.company_name && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-ink bg-canvas border border-line px-2 py-0.5 rounded-sm">
                          <BuildingOffice2Icon className="w-3 h-3 text-accent-text" aria-hidden="true" /> {req.company_name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-ink">{req.inquiry_type}</span>
                      {req.subject && req.subject !== req.inquiry_type && (
                        <div className="text-xs text-muted mt-1 max-w-[12rem] truncate" title={req.subject}>{req.subject}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-xs text-ink whitespace-pre-line leading-relaxed bg-canvas p-3 rounded-sm border border-line max-h-40 overflow-y-auto">{req.message}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted whitespace-nowrap">
                      <time dateTime={req.created_at}>
                        {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="block">{new Date(req.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </time>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <label htmlFor={`status-${req.id}`} className="sr-only">Status for {req.name}</label>
                      <select
                        id={`status-${req.id}`}
                        value={req.status || 'New'}
                        onChange={(e) => updateStatus(req.id, e.target.value as Status)}
                        className={`text-xs font-bold uppercase tracking-[0.06em] px-2.5 py-1.5 rounded-sm border cursor-pointer focus:outline-none focus:ring-2 focus:ring-ink/20 ${TONE[req.status] ?? TONE.Read}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button type="button" onClick={() => deleteInquiry(req)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft" aria-label={`Delete inquiry from ${req.name}`}>
                        <TrashIcon className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
