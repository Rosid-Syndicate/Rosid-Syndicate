import { NavLink, Link } from 'react-router-dom'
import {
  Squares2X2Icon,
  DocumentTextIcon,
  FolderIcon,
  InboxIcon,
  BuildingOffice2Icon,
  PencilSquareIcon,
  ShieldCheckIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import Seo from './Seo'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
  { name: 'Inquiries', href: '/admin/inquiries', icon: InboxIcon },
  { name: 'Blog posts', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
  { name: 'Companies', href: '/admin/companies', icon: BuildingOffice2Icon },
  { name: 'Site content', href: '/admin/content', icon: PencilSquareIcon },
  { name: 'Credentials', href: '/admin/credentials', icon: ShieldCheckIcon },
]

/**
 * Admin shell. One light theme for every admin page (three pages previously
 * rendered white headings on the light background and were unreadable).
 * Marked noindex; Vercel additionally sends X-Robots-Tag for /admin/*.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-canvas text-muted flex flex-col lg:flex-row">
      <Seo title="Admin" path="/admin" noindex />

      <aside className="lg:w-64 shrink-0 bg-surface border-b lg:border-b-0 lg:border-r border-line flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
          <Link to="/admin/dashboard" className="flex items-center gap-3 rounded-sm">
            <img src="/brand/logo-mark-128.png" width={128} height={128} alt="" className="h-9 w-auto" />
            <span className="leading-none">
              <span className="block font-display font-black text-sm tracking-[0.18em] text-ink">ROSID</span>
              <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted mt-0.5">Admin</span>
            </span>
          </Link>
          <a href="/" target="_blank" rel="noopener" className="lg:hidden btn-ghost btn-sm" aria-label="Open live website in a new tab">
            <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <nav aria-label="Admin" className="flex-1 p-3 overflow-x-auto lg:overflow-visible">
          <ul className="flex lg:flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold whitespace-nowrap transition-colors duration-fast ${
                      isActive ? 'bg-ink text-white' : 'text-ink hover:bg-canvas'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block p-4 border-t border-line space-y-3">
          <p className="text-xs text-muted truncate" title={user?.email ?? ''}>{user?.email}</p>
          <a href="/" target="_blank" rel="noopener" className="btn-secondary btn-sm w-full">
            Live website <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
          <button type="button" onClick={signOut} className="btn-ghost btn-sm w-full justify-start">
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center justify-end gap-2 px-4 py-2 border-b border-line bg-surface">
          <span className="text-xs text-muted truncate mr-auto">{user?.email}</span>
          <button type="button" onClick={signOut} className="btn-ghost btn-sm">Sign out</button>
        </div>
        {children}
      </div>
    </div>
  )
}
