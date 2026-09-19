import { Outlet } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

/**
 * Wraps the /admin route subtree with the Supabase auth context.
 *
 * Lazy-loaded from App.tsx so the Supabase client (≈57 kB gzip) and the auth
 * session check are only downloaded when someone opens the admin, not on every
 * public page view.
 */
export default function AdminArea() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
