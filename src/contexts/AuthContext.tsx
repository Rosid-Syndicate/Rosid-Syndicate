import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type StaffRole = 'admin' | 'editor'

type AuthContextType = {
  session: Session | null
  user: User | null
  /** null = signed in but not on the staff list (or role not resolved yet) */
  role: StaffRole | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
})

/**
 * Supabase session + staff role. The role comes from the database
 * (`link_admin_user()` / `staff_role()` RPCs backed by `admin_users`), so the
 * UI can hide what a user cannot do — the real enforcement is RLS.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<StaffRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const resolveRole = async (s: Session | null) => {
      if (!s) {
        setRole(null)
        return
      }
      // link_admin_user attaches an email-invited row to this account and returns the role
      const { data, error } = await supabase.rpc('link_admin_user')
      if (cancelled) return
      if (error) {
        // migration not applied yet or transient error: fall back to staff_role()
        const fallback = await supabase.rpc('staff_role')
        setRole((fallback.data as StaffRole | null) ?? null)
        return
      }
      setRole((data as StaffRole | null) ?? null)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      await resolveRole(session)
      if (!cancelled) setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (cancelled) return
      setSession(s)
      setIsLoading(true)
      await resolveRole(s)
      if (!cancelled) setIsLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider
export const useAuth = () => useContext(AuthContext)
