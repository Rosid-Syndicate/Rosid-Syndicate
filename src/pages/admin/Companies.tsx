import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

type Company = {
  id: string
  name: string
  slug: string
  description: string | null
  is_archived: boolean
}

const slugify = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80)

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState<Company | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({ name: '', slug: '', description: '' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('companies').select('id, name, slug, description, is_archived').order('created_at', { ascending: true }).limit(200)
    if (error) {
      setState('error')
      toast.error(`Could not load companies: ${error.message}`)
      return
    }
    setCompanies((data ?? []) as Company[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleArchive = async (c: Company) => {
    const { error } = await supabase.from('companies').update({ is_archived: !c.is_archived }).eq('id', c.id)
    if (error) {
      toast.error(`Could not update: ${error.message}`)
      return
    }
    toast.success(c.is_archived ? 'Company restored' : 'Company archived')
    load()
  }

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    if (!editing.name.trim()) {
      toast.error('Company name is required.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('companies').update({ name: editing.name.trim(), description: editing.description?.trim() || null }).eq('id', editing.id)
    setBusy(false)
    if (error) {
      toast.error(`Save failed: ${error.message}`)
      return
    }
    toast.success('Company updated')
    setEditing(null)
    load()
  }

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const slug = slugify(draft.slug || draft.name)
    if (!draft.name.trim() || !slug) {
      toast.error('Name and URL slug are required.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('companies').insert({ name: draft.name.trim(), slug, description: draft.description.trim() || null })
    setBusy(false)
    if (error) {
      toast.error(/duplicate key/i.test(error.message) ? 'That slug already exists.' : `Creation failed: ${error.message}`)
      return
    }
    toast.success('Company created')
    setCreating(false)
    setDraft({ name: '', slug: '', description: '' })
    load()
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Companies</h1>
          <p className="mt-1 text-sm text-muted">Subsidiary records in the database.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="btn-primary btn-sm">
          <PlusIcon className="w-4 h-4" aria-hidden="true" /> Add company
        </button>
      </header>

      <p className="card border-l-4 border-l-warning p-4 text-sm text-muted">
        <strong className="text-ink">Note:</strong> the public website currently renders company pages from bundled data (<code>src/data/companies.ts</code>), not from this table. Changes here do not appear on the live site until that integration is switched on — see WEBSITE_AUDIT.md (product decisions).
      </p>

      {creating && (
        <form onSubmit={create} className="card p-6 space-y-4" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">New company</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-name" className="field-label">Company name <span aria-hidden="true" className="text-accent-text">*</span></label>
              <input id="new-name" type="text" required maxLength={255} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} className="field" />
            </div>
            <div>
              <label htmlFor="new-slug" className="field-label">URL slug <span aria-hidden="true" className="text-accent-text">*</span></label>
              <input id="new-slug" type="text" required maxLength={80} value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} onBlur={() => setDraft({ ...draft, slug: slugify(draft.slug) })} className="field font-mono text-xs" placeholder="roshan-enterprises" />
            </div>
          </div>
          <div>
            <label htmlFor="new-desc" className="field-label">Description / core scope</label>
            <textarea id="new-desc" rows={3} maxLength={1000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary btn-sm">Create company</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {editing && (
        <form onSubmit={save} className="card p-6 space-y-4" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Edit company</h2>
          <div>
            <label htmlFor="edit-name" className="field-label">Company name <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="edit-name" type="text" required maxLength={255} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field" />
          </div>
          <div>
            <label htmlFor="edit-desc" className="field-label">Description / core scope</label>
            <textarea id="edit-desc" rows={3} maxLength={1000} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary btn-sm">Save changes</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      {state === 'loading' ? (
        <p className="text-sm text-muted" role="status">Loading…</p>
      ) : state === 'error' ? (
        <p className="text-sm text-danger" role="alert">Companies could not be loaded.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {companies.map((c) => (
            <li key={c.id} className={`card p-5 ${c.is_archived ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-ink leading-tight">{c.name}</h3>
                <span className={`shrink-0 text-xs font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-sm border ${c.is_archived ? 'bg-canvas text-muted border-line' : 'bg-success-soft text-success border-success/30'}`}>
                  {c.is_archived ? 'Archived' : 'Active'}
                </span>
              </div>
              <p className="mt-1 text-xs font-mono text-muted">/companies/{c.slug}</p>
              <p className="mt-3 text-sm text-muted leading-relaxed">{c.description}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setEditing(c)} className="btn-secondary btn-sm">Edit</button>
                <button type="button" onClick={() => toggleArchive(c)} className="btn-ghost btn-sm">{c.is_archived ? 'Restore' : 'Archive'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
