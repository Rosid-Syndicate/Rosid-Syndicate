import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useConfirm } from '../../components/ConfirmDialog'

type Credential = {
  id: string
  title: string
  category: string
  description: string | null
  file_url: string
  is_public: boolean
  created_at: string
}

// Must match CATEGORIES in src/pages/Credentials.tsx
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

const MAX_BYTES = 10 * 1024 * 1024
const ACCEPT: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }

export default function Credentials() {
  const confirm = useConfirm()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [draft, setDraft] = useState({ title: '', category: CATEGORIES[0], description: '', is_public: false })
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('credentials').select('id, title, category, description, file_url, is_public, created_at').order('created_at', { ascending: false }).limit(500)
    if (error) {
      setState('error')
      toast.error(`Could not load credentials: ${error.message}`)
      return
    }
    setCredentials((data ?? []) as Credential[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const togglePublic = async (c: Credential) => {
    const { error } = await supabase.from('credentials').update({ is_public: !c.is_public }).eq('id', c.id)
    if (error) {
      toast.error(`Could not update visibility: ${error.message}`)
      return
    }
    toast.success(c.is_public ? 'Document set to internal only' : 'Document published')
    load()
  }

  const remove = async (c: Credential) => {
    const ok = await confirm({ title: `Delete "${c.title}"?`, description: 'The record and the uploaded file are removed permanently.', confirmLabel: 'Delete document', tone: 'danger' })
    if (!ok) return
    const { error } = await supabase.from('credentials').delete().eq('id', c.id)
    if (error) {
      toast.error(`Delete failed: ${error.message}`)
      return
    }
    const { error: storageError } = await supabase.storage.from('credentials_files').remove([c.file_url])
    if (storageError) toast.error(`Record deleted but the file could not be removed: ${storageError.message}`)
    else toast.success('Document deleted')
    load()
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (!f) return setFile(null)
    const ext = ACCEPT[f.type]
    const nameExt = f.name.split('.').pop()?.toLowerCase()
    if (!ext || (nameExt !== ext && !(ext === 'jpg' && nameExt === 'jpeg'))) {
      toast.error('Only PDF, JPG and PNG files are accepted.')
      e.target.value = ''
      return setFile(null)
    }
    if (f.size > MAX_BYTES) {
      toast.error('File exceeds the 10 MB limit.')
      e.target.value = ''
      return setFile(null)
    }
    setFile(f)
  }

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return toast.error('Please choose a file.')
    if (!draft.title.trim()) return toast.error('Please enter a document title.')
    setUploading(true)
    try {
      const ext = ACCEPT[file.type]
      const safeCategory = draft.category.replace(/[^a-zA-Z0-9]/g, '_')
      const path = `${safeCategory}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage.from('credentials_files').upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr
      const { error: dbErr } = await supabase.from('credentials').insert({
        title: draft.title.trim(),
        category: draft.category,
        description: draft.description.trim() || null,
        file_url: path,
        is_public: draft.is_public,
      })
      if (dbErr) {
        await supabase.storage.from('credentials_files').remove([path])
        throw dbErr
      }
      toast.success('Document uploaded')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setDraft({ title: '', category: CATEGORIES[0], description: '', is_public: false })
      load()
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const view = async (c: Credential) => {
    // Signed URL so internal-only documents never depend on a guessable public path.
    const { data, error } = await supabase.storage.from('credentials_files').createSignedUrl(c.file_url, 60)
    if (error || !data) {
      toast.error('Could not open the document')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-h2 text-ink">Credentials</h1>
        <p className="mt-1 text-sm text-muted">Registrations, licences and certificates. Only documents marked public appear on the website.</p>
      </header>

      <form onSubmit={upload} className="card p-6 space-y-4" noValidate>
        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Upload a document</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cred-title" className="field-label">Document title <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="cred-title" type="text" required maxLength={255} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="field" />
          </div>
          <div>
            <label htmlFor="cred-category" className="field-label">Category</label>
            <select id="cred-category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="cred-desc" className="field-label">Description</label>
          <input id="cred-desc" type="text" maxLength={500} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="field" placeholder="Issuing authority, validity, registration number…" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="cred-file" className="field-label">File (PDF, JPG, PNG · max 10 MB) <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="cred-file" ref={fileRef} type="file" required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={onFile} className="field py-2 file:mr-4 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:bg-ink file:text-white file:text-xs file:font-bold" />
          </div>
          <label className="inline-flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="checkbox" checked={draft.is_public} onChange={(e) => setDraft({ ...draft, is_public: e.target.checked })} className="w-4 h-4 rounded-sm border-line text-ink focus:ring-ink" />
            <span className="text-sm font-semibold text-ink">Publicly visible on the website</span>
          </label>
        </div>
        <button type="submit" disabled={uploading} className="btn-primary" aria-busy={uploading}>
          {uploading ? 'Uploading…' : 'Upload document'}
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Uploaded credential documents</caption>
          <thead className="bg-canvas text-xs font-bold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="px-5 py-3">Document</th>
              <th scope="col" className="px-5 py-3">Category</th>
              <th scope="col" className="px-5 py-3">Visibility</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {state === 'loading' ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">Loading…</td></tr>
            ) : state === 'error' ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-danger">Credentials could not be loaded.</td></tr>
            ) : credentials.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">No documents uploaded yet.</td></tr>
            ) : (
              credentials.map((c) => (
                <tr key={c.id} className="hover:bg-canvas/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">{c.title}</div>
                    {c.description && <div className="text-xs text-muted mt-0.5 max-w-sm truncate" title={c.description}>{c.description}</div>}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">{c.category}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button type="button" onClick={() => togglePublic(c)} aria-pressed={c.is_public} className={`btn btn-sm border ${c.is_public ? 'bg-success-soft text-success border-success/30' : 'bg-canvas text-muted border-line'}`} title="Toggle public visibility">
                      {c.is_public ? 'Public' : 'Internal only'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => view(c)} className="btn-ghost btn-sm">View</button>
                    <button type="button" onClick={() => remove(c)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
