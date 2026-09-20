import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const FIELDS: { key: string; label: string; help: string }[] = [
  { key: 'mission', label: 'Corporate mission', help: 'One or two sentences.' },
  { key: 'vision', label: 'Corporate vision', help: 'One or two sentences.' },
  { key: 'core_values', label: 'Core values', help: 'Comma-separated list.' },
]

/**
 * Site content editor.
 *
 * Uses upsert on `section_key`: the previous version ran UPDATE on rows the
 * migration never seeded, so "Publish content" affected zero rows while showing
 * a success toast. Each save now reports the real outcome.
 */
export default function Content() {
  const [content, setContent] = useState<Record<string, string>>({})
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('section_key, content')
      .then(({ data, error }) => {
        if (error) {
          setState('error')
          toast.error(`Could not load content: ${error.message}`)
          return
        }
        const map: Record<string, string> = {}
        for (const row of data ?? []) map[row.section_key] = row.content
        setContent(map)
        setState('ready')
      })
  }, [])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const rows = FIELDS.filter((f) => (content[f.key] ?? '').trim() !== '').map((f) => ({
      section_key: f.key,
      content: content[f.key].trim(),
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'section_key' })
    setSaving(false)
    if (error) {
      toast.error(`Save failed: ${error.message}`)
      return
    }
    toast.success(`Saved ${rows.length} section${rows.length === 1 ? '' : 's'}`)
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-h2 text-ink">Site content</h1>
        <p className="mt-1 text-sm text-muted">Mission, vision and core values stored in the database.</p>
      </header>

      <p className="card border-l-4 border-l-warning p-4 text-sm text-muted">
        <strong className="text-ink">Note:</strong> the public website currently shows the mission statement from bundled copy, not from this table. Saving here stores the text for when that integration is switched on — see WEBSITE_AUDIT.md (product decisions).
      </p>

      {state === 'loading' ? (
        <p className="text-sm text-muted" role="status">Loading…</p>
      ) : state === 'error' ? (
        <p className="text-sm text-danger" role="alert">Content could not be loaded.</p>
      ) : (
        <form onSubmit={save} className="card p-6 sm:p-8 space-y-6" noValidate>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={`content-${f.key}`} className="field-label">{f.label}</label>
              <textarea
                id={`content-${f.key}`}
                rows={4}
                maxLength={2000}
                value={content[f.key] ?? ''}
                onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                className="field"
                aria-describedby={`help-${f.key}`}
              />
              <p id={`help-${f.key}`} className="mt-1 text-xs text-muted">{f.help}</p>
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary" aria-busy={saving}>
            {saving ? 'Saving…' : 'Save content'}
          </button>
        </form>
      )}
    </div>
  )
}
