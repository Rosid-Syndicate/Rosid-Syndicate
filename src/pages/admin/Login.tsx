import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Seo from '../../components/Seo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const { user } = useAuth()

  if (user) return <Navigate to="/admin/dashboard" replace />

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (authError) {
      // Generic message: do not reveal whether the account exists (enumeration).
      setError('Sign-in failed. Check your email and password and try again.')
      return
    }
    nav('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <Seo title="Admin sign in" path="/admin/login" noindex />
      <div className="w-full max-w-md bg-surface p-8 rounded-sm shadow-raised border-t-4 border-t-accent">
        <div className="mb-8 text-center">
          <img src="/brand/logo-full-320.png" width={320} height={320} alt="Rosid Syndicates Group" className="h-24 w-auto mx-auto" />
          <h1 className="mt-6 text-h3 text-ink">Admin sign in</h1>
          <p className="text-sm text-muted mt-1">Authorised staff only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="field-label">Email</label>
            <input id="login-email" name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="login-password" className="field-label">Password</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full" aria-busy={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="min-h-[1.25rem]" aria-live="polite">
            {error && <p role="alert" className="text-sm text-danger font-medium">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}
