import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type StaffRole } from '../contexts/AuthContext'
import Seo from './Seo'

/**
 * Client-side guard for admin routes (UX only — data access is enforced by RLS).
 * - signed out            → /admin/login
 * - signed in, not staff  → clear "no access" message (previously the dashboard
 *                           loaded and every panel silently errored)
 * - `requireRole`         → editors are kept out of admin-only areas
 */
export default function ProtectedRoute({ requireRole }: { requireRole?: StaffRole }) {
  const { user, role, isLoading, signOut } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Checking your session…</span>
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  if (!role) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <Seo title="No admin access" path="/admin" noindex />
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-h3 text-ink">This account has no admin access</h1>
          <p className="mt-3 text-sm text-muted">
            You are signed in as <span className="font-semibold text-ink">{user.email}</span>, but this email is not on the staff list. Ask an administrator to add you under Admin → Users.
          </p>
          <button type="button" onClick={signOut} className="btn-primary mt-6">Sign out</button>
        </div>
      </div>
    )
  }

  if (requireRole && role !== requireRole) return <Navigate to="/admin/dashboard" replace />

  return <Outlet />
}
