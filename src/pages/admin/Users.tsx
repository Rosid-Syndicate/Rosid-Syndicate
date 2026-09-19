import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth, type StaffRole } from '../../contexts/AuthContext'
import { useConfirm } from '../../components/ConfirmDialog'

type StaffUser = {
  id: string
  email: string | null
  role: StaffRole
  is_active: boolean
  user_id: string | null
  note: string | null
  created_at: string
}

const ROLE_HELP: Record<StaffRole, string> = {
  admin: 'Everything: inquiries, credentials, companies, users, and all content.',
  editor: 'Content only: blog posts, categories, testimonials, FAQs, site content.',
}

/**
 * Staff list and roles. Rows are matched to Supabase Auth accounts by email
 * (linked automatically on first sign-in). Creating the login itself happens in
 * Supabase Authentication → Users (the browser never receives a service key).
 */
export default function Users() {
  const { user: me } = useAuth()
  const confirm = useConfirm()
  const [rows, setRows] = useState<StaffUser[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('editor')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('admin_users').select('id, email, role, is_active, user_id, note, created_at').order('created_at', { ascending: true }).limit(200)
    if (error) {
      setState('error')
      toast.error(`Could not load users: ${error.message}`)
      return
    }
    setRows((data ?? []) as StaffUser[])
    setState('ready')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      toast.error('Enter a valid email address.')
      return
    }
    setBusy(true)
    const { error } = await supabase.from('admin_users').insert({ email: clean, role, note: note.trim() || null })
    setBusy(false)
    if (error) {
      toast.error(/duplicate key/i.test(error.message) ? 'That email is already on the list.' : `Could not add user: ${error.message}`)
      return
    }
    toast.success(`${clean} added as ${role}`)
    setEmail('')
    setNote('')
    load()
  }

  const isMe = (r: StaffUser) => Boolean(me && (r.user_id === me.id || (r.email && me.email && r.email.toLowerCase() === me.email.toLowerCase())))

  const changeRole = async (r: StaffUser, next: StaffRole) => {
    if (isMe(r) && next !== 'admin') {
      const ok = await confirm({ title: 'Remove your own admin rights?', description: 'You will lose access to inquiries, users and credentials immediately.', confirmLabel: 'Change my role', tone: 'danger' })
      if (!ok) return
    }
    const { error } = await supabase.from('admin_users').update({ role: next }).eq('id', r.id)
    if (error) {
      toast.error(error.message.includes('active admin') ? 'At least one active admin must remain.' : `Could not change role: ${error.message}`)
      return
    }
    toast.success(`${r.email ?? 'User'} is now ${next}`)
    load()
  }

  const toggleActive = async (r: StaffUser) => {
    if (r.is_active) {
      const ok = await confirm({ title: `Deactivate ${r.email ?? 'this user'}?`, description: 'They keep their login but lose all admin access until reactivated.', confirmLabel: 'Deactivate', tone: 'danger' })
      if (!ok) return
    }
    const { error } = await supabase.from('admin_users').update({ is_active: !r.is_active }).eq('id', r.id)
    if (error) {
      toast.error(error.message.includes('active admin') ? 'At least one active admin must remain.' : `Could not update: ${error.message}`)
      return
    }
    toast.success(r.is_active ? 'User deactivated' : 'User reactivated')
    load()
  }

  const remove = async (r: StaffUser) => {
    const ok = await confirm({ title: `Remove ${r.email ?? 'this user'} from staff?`, description: 'This removes admin access only. Their Supabase login (if any) is not deleted — remove it in Supabase Authentication if needed.', confirmLabel: 'Remove', tone: 'danger' })
    if (!ok) return
    const { error } = await supabase.from('admin_users').delete().eq('id', r.id)
    if (error) {
      toast.error(error.message.includes('active admin') ? 'At least one active admin must remain.' : `Could not remove: ${error.message}`)
      return
    }
    toast.success('Removed from staff')
    load()
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-h2 text-ink">Users &amp; roles</h1>
        <p className="mt-1 text-sm text-muted">Who can sign in to this admin and what they can do.</p>
      </header>

      <div className="grid md:grid-cols-12 gap-6">
        <form onSubmit={add} className="md:col-span-5 card p-6 space-y-4" noValidate>
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted pb-3 border-b border-line inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4 text-accent-text" aria-hidden="true" /> Add staff member
          </h2>
          <div>
            <label htmlFor="staff-email" className="field-label">Work email <span aria-hidden="true" className="text-accent-text">*</span></label>
            <input id="staff-email" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="name@company.com" />
          </div>
          <div>
            <label htmlFor="staff-role" className="field-label">Role</label>
            <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="field" aria-describedby="role-help">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <p id="role-help" className="mt-1 text-xs text-muted">{ROLE_HELP[role]}</p>
          </div>
          <div>
            <label htmlFor="staff-note" className="field-label">Note (optional)</label>
            <input id="staff-note" type="text" maxLength={160} value={note} onChange={(e) => setNote(e.target.value)} className="field" placeholder="e.g. Communications team" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full" aria-busy={busy}>{busy ? 'Adding…' : 'Add to staff'}</button>
          <p className="text-xs text-muted leading-relaxed">
            Then create their login in Supabase → Authentication → Users → <em>Add user</em> (or send an invite). Their access activates on first sign-in with this email.
          </p>
        </form>

        <section className="md:col-span-7 card overflow-hidden" aria-labelledby="staff-list">
          <h2 id="staff-list" className="p-4 bg-canvas border-b border-line text-xs font-bold uppercase tracking-[0.1em] text-muted">Staff ({rows.length})</h2>
          {state === 'loading' ? (
            <p className="p-6 text-sm text-muted" role="status">Loading…</p>
          ) : state === 'error' ? (
            <p className="p-6 text-sm text-danger" role="alert">The staff list could not be loaded. Only admins can view it; make sure the roles migration is applied.</p>
          ) : (
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${r.is_active ? '' : 'opacity-60'}`}>
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-canvas border border-line text-ink shrink-0" aria-hidden="true">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {r.email ?? <span className="text-muted">(no email on record)</span>}
                        {isMe(r) && <span className="ml-2 text-xs font-bold text-accent-text">you</span>}
                      </p>
                      <p className="text-xs text-muted">
                        {r.user_id ? 'Linked to a login' : 'Awaiting first sign-in'}
                        {r.note ? ` · ${r.note}` : ''}
                        {!r.is_active && ' · Deactivated'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`role-${r.id}`} className="sr-only">Role for {r.email}</label>
                    <select id={`role-${r.id}`} value={r.role} onChange={(e) => changeRole(r, e.target.value as StaffRole)} className="field py-1.5 text-xs w-auto">
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button type="button" onClick={() => toggleActive(r)} className="btn-ghost btn-sm">{r.is_active ? 'Deactivate' : 'Reactivate'}</button>
                    <button type="button" onClick={() => remove(r)} className="btn-ghost btn-sm text-danger hover:bg-danger-soft" aria-label={`Remove ${r.email ?? 'user'}`}>
                      <TrashIcon className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
