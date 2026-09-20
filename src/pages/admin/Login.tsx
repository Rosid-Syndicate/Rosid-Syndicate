import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { EyeIcon, EyeSlashIcon, InboxStackIcon, NewspaperIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Seo from '../../components/Seo'
import { SITE_HOST, SITE_NAME } from '../../config/site'

// The human check on sign-in is opt-in: set VITE_AUTH_CAPTCHA=true only after
// enabling "Attack protection → CAPTCHA" (Turnstile) in Supabase, which is what
// actually verifies the token. Rendering the widget without that is friction
// with no security benefit, and a network that cannot reach Cloudflare's
// challenge hosts sees a failed widget on a page that never needed one.
const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? '1x00000000000000000000AA' : '')
const CAPTCHA_ENABLED = import.meta.env.VITE_AUTH_CAPTCHA === 'true' && TURNSTILE_SITE_KEY.length > 0
// Google sign-in needs the provider enabled in Supabase; keep the button hidden until then.
const GOOGLE_ENABLED = import.meta.env.VITE_AUTH_GOOGLE_SIGNIN === 'true'

type Mode = 'signin' | 'reset' | 'reset-sent'

const FEATURES = [
  { icon: InboxStackIcon, title: 'Inquiries and tender requests', text: 'Track every website lead from New to Closed and export it to CSV.' },
  { icon: NewspaperIcon, title: 'Website content', text: 'Publish articles, FAQs, testimonials and the mission statement.' },
  { icon: ShieldCheckIcon, title: 'Credentials and staff', text: 'Keep company documents and staff roles current.' },
]

/** Only ever return to a page inside the admin area. */
function safeReturnPath(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && /^\/admin(\/|$)/.test(from) && from !== '/admin/login' ? from : '/admin/dashboard'
}

export default function Login() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'reset' ? 'reset' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()
  const nav = useNavigate()
  const location = useLocation()
  const { user, isLoading } = useAuth()

  const returnTo = safeReturnPath(location.state)
  if (user) return <Navigate to={returnTo} replace />
  // A stored session resolves in a few ms; waiting avoids flashing the form at
  // someone who is already signed in.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Checking your session…</span>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    )
  }

  // The widget is a convenience, not the boundary: the token is sent when we
  // have one and Supabase enforces it only if CAPTCHA is enabled there. Never
  // block submission on the client — a widget that cannot load (blocked
  // network, hostname not yet allowed in Cloudflare) must not lock staff out.
  const resetCaptcha = () => {
    setCaptchaToken('')
    turnstileRef.current?.reset()
  }

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })
    setLoading(false)
    if (authError) {
      // Generic message: do not reveal whether the account exists (enumeration).
      // The one exception is a captcha rejection, which the user can act on.
      const captchaRejected = /captcha/i.test(authError.message || '')
      setError(captchaRejected ? 'Human verification failed. Complete the check and try again.' : 'Sign-in failed. Check your email and password and try again.')
      resetCaptcha()
      return
    }
    nav(returnTo, { replace: true })
  }

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
      ...(captchaToken ? { captchaToken } : {}),
    })
    setLoading(false)
    resetCaptcha()
    if (resetError && resetError.status && resetError.status >= 500) {
      setError('The reset email could not be sent right now. Please try again in a moment.')
      return
    }
    // Same response whether or not the address is known (no enumeration).
    setMode('reset-sent')
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${returnTo}`, queryParams: { prompt: 'select_account' } },
    })
    if (oauthError) {
      setLoading(false)
      setError('Google sign-in is not available right now. Use your email and password instead.')
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setPassword('')
    resetCaptcha()
  }

  const captcha = CAPTCHA_ENABLED && (
    <div className="turnstile-slot !w-full !max-w-none">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken('')}
        onError={() => setCaptchaToken('')}
        options={{ theme: 'light', size: 'flexible', action: mode === 'signin' ? 'login' : 'password-reset' }}
      />
    </div>
  )

  // Announced politely; sits directly above the primary action so it is seen
  // before the next attempt.
  const errorRegion = (
    <div aria-live="polite">
      {error && (
        <p id={errorId} role="alert" className="mb-4 rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.1fr_1fr]">
      <Seo title={mode === 'signin' ? 'Admin sign in' : 'Reset password'} path="/admin/login" noindex />

      {/* Brand panel — desktop only */}
      <aside className="relative hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:self-start flex-col justify-between overflow-hidden bg-deep text-white p-10 xl:p-14 [@media(max-height:700px)]:p-8" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -left-40 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-56 -right-32 h-[36rem] w-[36rem] rounded-full bg-ink-700/70 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
        </div>

        <div className="relative flex items-center gap-3">
          <img src="/brand/logo-mark-128.png" width={128} height={128} alt="" className="h-11 w-11 rounded-sm bg-white p-1" />
          <div>
            <p className="text-sm font-bold tracking-wide">{SITE_NAME}</p>
            <p className="text-xs text-white/60">Admin console</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="eyebrow-on-dark eyebrow">Welcome back</p>
          <h2 className="mt-4 text-h1 font-display text-white [@media(max-height:760px)]:text-h2">Everything the website needs, in one secure place.</h2>
          <p className="mt-4 text-lead text-white/70 [@media(max-height:760px)]:text-base">Manage inquiries, tenders, credentials and published content for the group's five companies.</p>
          <ul className="mt-8 space-y-3 [@media(max-height:760px)]:hidden">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="panel-dark flex items-start gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-0.5 text-sm text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Access is limited to staff on the allow-list. Sessions are protected by Supabase Auth
          {CAPTCHA_ENABLED ? ' and Cloudflare Turnstile' : ''}.
        </p>
      </aside>

      {/* Form column */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden px-5 py-5 sm:px-8">
        <div className="pointer-events-none absolute -top-40 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-dots-light bg-dots [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" aria-hidden="true" />
        <div className="relative mb-6 flex items-center gap-3 lg:hidden">
          <img src="/brand/logo-mark-128.png" width={128} height={128} alt="" className="h-10 w-10 rounded-sm bg-white p-1 shadow-card" />
          <div>
            <p className="text-sm font-bold text-ink">{SITE_NAME}</p>
            <p className="text-xs text-muted">Admin console</p>
          </div>
        </div>

        <div className="relative w-full max-w-[26rem]">
          <div className="card shadow-raised p-6 sm:p-7">
            <div className="mb-6 text-center">
              {mode === 'signin' && (
                <>
                  <h1 className="text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">Welcome back</h1>
                  <p className="mt-1.5 text-sm text-muted">Sign in to the admin console</p>
                </>
              )}
              {mode === 'reset' && (
                <>
                  <h1 className="text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">Reset your password</h1>
                  <p className="mt-2 text-sm text-muted">Enter your work email and we will send you a link to choose a new password.</p>
                </>
              )}
              {mode === 'reset-sent' && (
                <>
                  <h1 className="text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">Check your inbox</h1>
                  <p className="mt-2 text-sm text-muted">
                    If <span className="font-semibold text-ink">{email.trim()}</span> belongs to a staff account, a reset link is on its way. It expires after one hour.
                  </p>
                </>
              )}
            </div>

            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4" noValidate aria-describedby={error ? errorId : undefined}>
                <div>
                  <label htmlFor={emailId} className="field-label">Email</label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoFocus
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <label htmlFor={passwordId} className="field-label !mb-0">Password</label>
                    <button type="button" onClick={() => switchMode('reset')} className="text-xs font-semibold text-accent-text underline-offset-4 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id={passwordId}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 rounded-sm"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {captcha}

                <div>
                  {errorRegion}
                  <button type="submit" disabled={loading} className="btn-primary w-full" aria-busy={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>

                {GOOGLE_ENABLED && (
                  <>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.12em] text-muted" role="separator">
                      <span className="h-px flex-1 bg-line" />
                      or
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <button type="button" onClick={handleGoogle} disabled={loading} className="btn-secondary w-full">
                      <GoogleMark />
                      Continue with Google
                    </button>
                  </>
                )}
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleReset} className="space-y-4" noValidate aria-describedby={error ? errorId : undefined}>
                <div>
                  <label htmlFor={emailId} className="field-label">Email</label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoFocus
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field"
                  />
                </div>

                {captcha}

                <div>
                  {errorRegion}
                  <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full" aria-busy={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </div>
                <button type="button" onClick={() => switchMode('signin')} className="btn-ghost w-full">
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Back to sign in
                </button>
              </form>
            )}

            {mode === 'reset-sent' && (
              <div className="space-y-4">
                <p className="text-sm text-muted">Nothing arrived? Check your spam folder, or ask an administrator to confirm the email on your staff record.</p>
                <button type="button" onClick={() => switchMode('signin')} className="btn-primary w-full">
                  Back to sign in
                </button>
              </div>
            )}
          </div>

          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted">
            <span>Authorised staff only — need access? Ask an administrator.</span>
            <Link to="/" className="font-semibold text-ink underline-offset-4 hover:underline">
              ← Back to {SITE_HOST}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Google "G" mark, per Google's sign-in branding guidelines. */
function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
