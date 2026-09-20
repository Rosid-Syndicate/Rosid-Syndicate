import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useConfirm } from '../../components/ConfirmDialog'
import ImageField from '../../components/ImageField'

type Testimonial = {
  id: string
  author_name: string
  author_role: string | null
  company: string | null
  quote: string
  photo_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
}

type Draft = Omit<Testimonial, 'id' | 'created_at' | 'sort_order'>
const EMPTY: Draft = { author_name: '', author_role: '', company: '', quote: '', photo_url: '', is_published: false }

/**
 * Testimonials. Published rows appear on the home page in the order shown
 * here. Nothing is shown publicly until at least one testimonial is published —
 * there are no placeholders.
 */
export default function Testimonials() {
  const confirm = useConfirm()
  const [rows, setRows] = useState<Testimonial[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(200)
    if (error) {
      setState('error')
      toast.error(`Could not load testimonials: ${error.message}`)
      return
    }
    setRows((data ?? []) as Testimonial[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const d = editing.draft
    if (d.author_name.trim().length < 2 || d.quote.trim().length < 10) {
      toast.error('Author name and a quote of at least 10 characters are required.')
      return
    }
    setBusy(true)
    const payload = {
      author_name: d.author_name.trim(),
      author_role: d.author_role?.trim() || null,
      company: d.company?.trim() || null,
      quote: d.quote.trim(),
      photo_url: d.photo_url?.trim() || null,
      is_published: d.is_published,
    }
    const result = editing.id
      ? await supabase.from('testimonials').update(payload).eq('id', editing.id)
      : await supabase.from('testimonials').insert({ ...payload, sort_order: (rows.at(-1)?.sort_order ?? 0) + 10 })
    setBusy(false)
    if (result.error) {
      toast.error(`Save failed: ${result.error.message}`)
      return
    }
    toast.success(editing.id ? 'Testimonial updated' : 'Testimonial added')
    setEditing(null)
    load()
  }

  const togglePublish = async (t: Testimonial) => {
    const { error } = await supabase.from('testimonials').update({ is_published: !t.is_published }).eq('id', t.id)
    if (error) return toast.error(`Could not update: ${error.message}`)
    toast.success(t.is_published ? 'Hidden from the website' : 'Published on the website')
    load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const other = rows[index + dir]
    if (!other) return
    const a = rows[index]
    const [ra, rb] = await Promise.all([
      supabase.from('testimonials').update({ sort_order: other.sort_order }).eq('id', a.id),
      supabase.from('testimonials').update({ sort_order: a.sort_order }).eq('id', other.id),
    ])
    if (ra.error || rb.error) return toast.error('Could not reorder')
    // if both had the same sort_order, normalise
    if (a.sort_order === other.sort_order) {
      await Promise.all(rows.map((r, i) => supabase.from('testimonials').update({ sort_order: (i === index ? index + dir : i === index + dir ? index : i) * 10 + 10 }).eq('id', r.id)))
    }
    load()
  }

  const remove = async (t: Testimonial) => {
    const ok = await confirm({ title: `Delete the testimonial from ${t.author_name}?`, description: 'This cannot be undone.', confirmLabel: 'Delete', tone: 'danger' })
    if (!ok) return
    const { error } = await supabase.from('testimonials').delete().eq('id', t.id)
    if (error) return toast.error(`Delete failed: ${error.message}`)
    toast.success('Testimonial deleted')
    load()
  }

  const set = (patch: Partial<Draft>) => setEditing((s) => (s ? { ...s, draft: { ...s.draft, ...patch } } : s))

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Testimonials</h1>
          <p className="mt-1 text-sm text-muted">Quotes from clients and partners, shown on the home page when published. Only use real, approved quotes.</p>
        </div>
        <button type="button" onClick={() => setEditing({ id: null, draft: EMPTY })} className="btn-primary btn-sm">
          <PlusIcon className="w-4 h-4" aria-hidden="true" /> Add testimonial
        </button>
      </header>

      {editing && (
        <form onSubmit={save} className="card p-6 sm:p-8 space-y-5" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{editing.id ? 'Edit testimonial' : 'New testimonial'}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="t-name" className="field-label">Author name <span aria-hidden="true" className="text-accent-text">*</span></label>
              <input id="t-name" type="text" required maxLength={160} value={editing.draft.author_name} onChange={(e) => set({ author_name: e.target.value })} className="field" />
            </div>
            <div>
              <label htmlFor="t-role" className="field-label">Role / title</label>
              <input id="t-role" type="text" maxLength={160} value={editing.draft.author_role ?? ''} onChange={(e) => set({ author_role: e.target.value })} className="field" placeholder="Project Director" />
            </div>
            <div>
              <label htmlFor="t-company" className="field-label">Company</label>
              <input id="t-company" type="text" maxLength={200} value={editing.draft.company ?? ''} onChange={(e) => set({ company: e.target.value })} className="field" />
            </div>
          </div>
          <div>
            <label htmlFor="t-quote" className="field-label">Quote <span aria-hidden="true" className="text-accent-text">*</span></label>
            <textarea id="t-quote" rows={4} required minLength={10} maxLength={1200} value={editing.draft.quote} onChange={(e) => set({ quote: e.target.value })} className="field" aria-describedby="t-quote-help" />
            <p id="t-quote-help" className="mt-1 text-xs text-muted">{editing.draft.quote.length}/1200 · keep it to two or three sentences.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 items-start">
            <ImageField label="Photo or logo (optional)" value={editing.draft.photo_url ?? ''} onChange={(url) => set({ photo_url: url })} folder="testimonials" previewClass="aspect-square max-w-[10rem]" hint="Square works best · up to 5 MB" />
            <label className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input type="checkbox" checked={editing.draft.is_published} onChange={(e) => set({ is_published: e.target.checked })} className="w-4 h-4 rounded-sm border-line text-ink focus:ring-ink" />
              <span className="text-sm font-semibold text-ink">Published on the website</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary btn-sm" aria-busy={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      <section className="card overflow-hidden" aria-labelledby="t-list">
        <h2 id="t-list" className="p-4 bg-canvas border-b border-line text-xs font-bold uppercase tracking-[0.1em] text-muted">
          All testimonials ({rows.length}) · {rows.filter((r) => r.is_published).length} published
        </h2>
        {state === 'loading' ? (
          <p className="p-6 text-sm text-muted" role="status">Loading…</p>
        ) : state === 'error' ? (
          <p className="p-6 text-sm text-danger" role="alert">Testimonials could not be loaded — is the roles/content migration applied?</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted">No testimonials yet. The home page section stays hidden until one is published.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((t, i) => (
              <li key={t.id} className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-relaxed">“{t.quote}”</p>
                  <p className="mt-2 text-xs text-muted">
                    <span className="font-semibold text-ink">{t.author_name}</span>
                    {t.author_role ? ` · ${t.author_role}` : ''}
                    {t.company ? ` · ${t.company}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                  <button type="button" onClick={() => togglePublish(t)} aria-pressed={t.is_published} className={`btn btn-sm border ${t.is_published ? 'bg-success-soft text-success border-success/30' : 'bg-warning-soft text-warning border-warning/30'}`}>
                    {t.is_published ? 'Published' : 'Draft'}
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost btn-sm" aria-label="Move up"><ArrowUpIcon className="w-4 h-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="btn-ghost btn-sm" aria-label="Move down"><ArrowDownIcon className="w-4 h-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => setEditing({ id: t.id, draft: { author_name: t.author_name, author_role: t.author_role ?? '', company: t.company ?? '', quote: t.quote, photo_url: t.photo_url ?? '', is_published: t.is_published } })} className="btn-ghost btn-sm" aria-label={`Edit testimonial from ${t.author_name}`}>
                    <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => remove(t)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft" aria-label={`Delete testimonial from ${t.author_name}`}>
                    <TrashIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
