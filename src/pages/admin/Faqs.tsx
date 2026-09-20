import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, PencilSquareIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useConfirm } from '../../components/ConfirmDialog'

type Faq = {
  id: string
  question: string
  answer: string
  is_published: boolean
  sort_order: number
  created_at: string
}

type Draft = { question: string; answer: string; is_published: boolean }
const EMPTY: Draft = { question: '', answer: '', is_published: true }

/**
 * FAQ manager. Published questions render on the home page (and as FAQPage
 * structured data) in this order; the bundled defaults are used only if the
 * database is unreachable.
 */
export default function Faqs() {
  const confirm = useConfirm()
  const [rows, setRows] = useState<Faq[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(200)
    if (error) {
      setState('error')
      toast.error(`Could not load FAQs: ${error.message}`)
      return
    }
    setRows((data ?? []) as Faq[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    const d = editing.draft
    if (d.question.trim().length < 5 || d.answer.trim().length < 10) {
      toast.error('A question (5+ characters) and an answer (10+ characters) are required.')
      return
    }
    setBusy(true)
    const payload = { question: d.question.trim(), answer: d.answer.trim(), is_published: d.is_published }
    const result = editing.id
      ? await supabase.from('faqs').update(payload).eq('id', editing.id)
      : await supabase.from('faqs').insert({ ...payload, sort_order: (rows.at(-1)?.sort_order ?? 0) + 10 })
    setBusy(false)
    if (result.error) return toast.error(`Save failed: ${result.error.message}`)
    toast.success(editing.id ? 'FAQ updated' : 'FAQ added')
    setEditing(null)
    load()
  }

  const togglePublish = async (f: Faq) => {
    const { error } = await supabase.from('faqs').update({ is_published: !f.is_published }).eq('id', f.id)
    if (error) return toast.error(`Could not update: ${error.message}`)
    load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const a = rows[index]
    const b = rows[index + dir]
    if (!b) return
    const next = [...rows]
    next[index] = b
    next[index + dir] = a
    const results = await Promise.all(next.map((r, i) => supabase.from('faqs').update({ sort_order: (i + 1) * 10 }).eq('id', r.id)))
    if (results.some((r) => r.error)) return toast.error('Could not reorder')
    load()
  }

  const remove = async (f: Faq) => {
    const ok = await confirm({ title: 'Delete this question?', description: f.question, confirmLabel: 'Delete', tone: 'danger' })
    if (!ok) return
    const { error } = await supabase.from('faqs').delete().eq('id', f.id)
    if (error) return toast.error(`Delete failed: ${error.message}`)
    toast.success('FAQ deleted')
    load()
  }

  const set = (patch: Partial<Draft>) => setEditing((s) => (s ? { ...s, draft: { ...s.draft, ...patch } } : s))

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">FAQs</h1>
          <p className="mt-1 text-sm text-muted">Questions shown on the home page, in this order. They are also published as FAQ structured data for search engines.</p>
        </div>
        <button type="button" onClick={() => setEditing({ id: null, draft: EMPTY })} className="btn-primary btn-sm">
          <PlusIcon className="w-4 h-4" aria-hidden="true" /> Add question
        </button>
      </header>

      {editing && (
        <form onSubmit={save} className="card p-6 sm:p-8 space-y-5" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{editing.id ? 'Edit question' : 'New question'}</h2>
          <div>
            <label htmlFor="faq-q" className="field-label">Question <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="faq-q" type="text" required maxLength={300} value={editing.draft.question} onChange={(e) => set({ question: e.target.value })} className="field" />
          </div>
          <div>
            <label htmlFor="faq-a" className="field-label">Answer <span aria-hidden="true" className="text-accent-text">*</span></label>
            <textarea id="faq-a" rows={4} required maxLength={2000} value={editing.draft.answer} onChange={(e) => set({ answer: e.target.value })} className="field" aria-describedby="faq-a-help" />
            <p id="faq-a-help" className="mt-1 text-xs text-muted">{editing.draft.answer.length}/2000 · plain text, one concise paragraph.</p>
          </div>
          <label className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="checkbox" checked={editing.draft.is_published} onChange={(e) => set({ is_published: e.target.checked })} className="w-4 h-4 rounded-sm border-line text-ink focus:ring-ink" />
            <span className="text-sm font-semibold text-ink">Published on the website</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary btn-sm" aria-busy={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      )}

      <section className="card overflow-hidden" aria-labelledby="faq-list">
        <h2 id="faq-list" className="p-4 bg-canvas border-b border-line text-xs font-bold uppercase tracking-[0.1em] text-muted">
          Questions ({rows.length}) · {rows.filter((r) => r.is_published).length} published
        </h2>
        {state === 'loading' ? (
          <p className="p-6 text-sm text-muted" role="status">Loading…</p>
        ) : state === 'error' ? (
          <p className="p-6 text-sm text-danger" role="alert">FAQs could not be loaded — is the roles/content migration applied?</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted">No questions yet. The website shows its bundled defaults until you add some.</p>
        ) : (
          <ol className="divide-y divide-line">
            {rows.map((f, i) => (
              <li key={f.id} className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-ink">{f.question}</h3>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{f.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                  <button type="button" onClick={() => togglePublish(f)} aria-pressed={f.is_published} className={`btn btn-sm border ${f.is_published ? 'bg-success-soft text-success border-success/30' : 'bg-warning-soft text-warning border-warning/30'}`}>
                    {f.is_published ? 'Published' : 'Hidden'}
                  </button>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost btn-sm" aria-label="Move up"><ArrowUpIcon className="w-4 h-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="btn-ghost btn-sm" aria-label="Move down"><ArrowDownIcon className="w-4 h-4" aria-hidden="true" /></button>
                  <button type="button" onClick={() => setEditing({ id: f.id, draft: { question: f.question, answer: f.answer, is_published: f.is_published } })} className="btn-ghost btn-sm" aria-label={`Edit: ${f.question}`}>
                    <PencilSquareIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => remove(f)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft" aria-label={`Delete: ${f.question}`}>
                    <TrashIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
