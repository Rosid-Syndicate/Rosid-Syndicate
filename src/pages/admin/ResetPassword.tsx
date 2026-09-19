import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Seo from '../../components/Seo'
import { SITE_NAME } from '../../config/site'

const MIN_LENGTH = 10

/**
 * Landing page for Supabase password-recovery links (`/admin/reset-password`).
 * The SDK exchanges the tokens in the URL for a session; while that session is
 * present the user may set a new password. Expired or reused links arrive with
 * an `error_description` in the hash and no session.
 */
export default function ResetPassword() {
  const { user, isLoading } = useAuth()
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const passwordId = useId()
  const confirmId = useId()
  const errorId = useId()

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const description = hash.get('error_description')
    if (description) {
      setLinkError(description.replace(/\+/g, ' '))
      // Remove the error from the address bar so a refresh does not re-show it.
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setStatus('saving')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setStatus('idle')
      setError(updateError.message || 'The password could not be changed. Request a new link and try again.')
      return
    }
    setStatus('done')
    window.setTimeout(() => nav('/admin/dashboard', { replace: true }), 1200)
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-5 py-10 sm:px-8">
      <Seo title="Choose a new password" path="/admin/reset-password" noindex />
      <div className="mb-8 flex items-center gap-3">
        <img src="/brand/logo-mark-128.png" width={128} height={128} alt="" className="h-10 w-10 rounded-sm bg-white p-1 shadow-card" />
        <div>
          <p className="text-sm font-bold text-ink">{SITE_NAME}</p>
          <p className="text-xs text-muted">Admin console</p>
        </div>
      </div>

      <div className="w-full max-w-[26rem]">
        <div className="card shadow-raised p-7 sm:p-9">
          {isLoading ? (
            <p className="text-center text-sm text-muted" role="status">Checking your reset link…</p>
          ) : !user ? (
            <div className="text-center">
              <h1 className="text-h2 text-ink">This link is no longer valid</h1>
              <p className="mt-3 text-sm text-muted">
                {linkError ? `${linkError}. ` : 'Reset links expire after one hour and can only be used once. '}
                Request a new one to continue.
              </p>
              <Link to="/admin/login?mode=reset" className="btn-primary mt-6 w-full">Request a new link</Link>
              <Link to="/admin/login" className="btn-ghost mt-2 w-full">Back to sign in</Link>
            </div>
          ) : status === 'done' ? (
            <div className="text-center" role="status">
              <h1 className="text-h2 text-ink">Password updated</h1>
              <p className="mt-3 text-sm text-muted">Taking you to the dashboard…</p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-h2 text-ink">Choose a new password</h1>
                <p className="mt-2 text-sm text-muted">
                  For <span className="font-semibold text-ink">{user.email}</span>. Use at least {MIN_LENGTH} characters; a passphrase is easiest to remember.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-describedby={error ? errorId : undefined}>
                <div>
                  <label htmlFor={passwordId} className="field-label">New password</label>
                  <div className="relative">
                    <input
                      id={passwordId}
                      name="new-password"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      autoFocus
                      required
                      minLength={MIN_LENGTH}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-pressed={show}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded-sm"
                    >
                      {show ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor={confirmId} className="field-label">Confirm password</label>
                  <input
                    id={confirmId}
                    name="confirm-password"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={MIN_LENGTH}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="field"
                  />
                </div>
                <button type="submit" disabled={status === 'saving'} className="btn-primary w-full" aria-busy={status === 'saving'}>
                  {status === 'saving' ? 'Saving…' : 'Set new password'}
                </button>
                <div className="min-h-[1.25rem]" aria-live="polite">
                  {error && (
                    <p id={errorId} role="alert" className="text-sm text-danger font-medium">
                      {error}
                    </p>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
