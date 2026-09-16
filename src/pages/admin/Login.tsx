import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Secure Admin Access Granted')
      nav('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0f172a] p-8 border border-white/5 shadow-2xl">
        <div className="mb-10 text-center">
          <img src="/logo.png" alt="Rosid Syndicates Group Logo" className="h-16 w-auto object-contain mx-auto mb-6" />
          <h1 className="text-xl font-display font-black tracking-[0.2em] text-white uppercase">Corporate Secure Portal</h1>
          <p className="text-sm text-slate-400 mt-2">Authorized Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-fire transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#020617] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-fire transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fire text-[#0f172a] font-bold text-sm uppercase tracking-widest py-4 hover:bg-fire-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
          </button>
        </form>
      </div>
    </div>
  )
}
