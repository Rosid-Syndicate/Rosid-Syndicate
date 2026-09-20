import { NavLink, Link } from 'react-router-dom'
import {
  Squares2X2Icon,
  DocumentTextIcon,
  FolderIcon,
  InboxIcon,
  BuildingOffice2Icon,
  PencilSquareIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useAuth, type StaffRole } from '../contexts/AuthContext'
import { ConfirmProvider } from './ConfirmDialog'
import Seo from './Seo'

type Item = { name: string; href: string; icon: typeof Squares2X2Icon; roles?: StaffRole[] }
type Group = { label: string; items: Item[] }

const NAV: Group[] = [
  { label: 'Overview', items: [{ name: 'Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon }] },
  { label: 'Leads', items: [{ name: 'Inquiries', href: '/admin/inquiries', icon: InboxIcon, roles: ['admin'] }] },
  {
    label: 'Content',
    items: [
      { name: 'Blog posts', href: '/admin/blog', icon: DocumentTextIcon },
      { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
      { name: 'Testimonials', href: '/admin/testimonials', icon: ChatBubbleBottomCenterTextIcon },
      { name: 'FAQs', href: '/admin/faqs', icon: QuestionMarkCircleIcon },
      { name: 'Site content', href: '/admin/content', icon: PencilSquareIcon },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { name: 'Companies', href: '/admin/companies', icon: BuildingOffice2Icon, roles: ['admin'] },
      { name: 'Credentials', href: '/admin/credentials', icon: ShieldCheckIcon, roles: ['admin'] },
    ],
  },
  { label: 'Settings', items: [{ name: 'Users & roles', href: '/admin/users', icon: UsersIcon, roles: ['admin'] }] },
]

/**
 * Admin shell: one light theme, grouped navigation, role-aware (editors do
 * not see admin-only areas — RLS enforces it regardless). Marked noindex;
 * Vercel additionally sends X-Robots-Tag for /admin/*.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user, role } = useAuth()
  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || (role && i.roles.includes(role))) })).filter((g) => g.items.length)

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-canvas text-muted flex flex-col lg:flex-row">
        <Seo title="Admin" path="/admin" noindex />

        <aside className="lg:w-64 shrink-0 bg-surface border-b lg:border-b-0 lg:border-r border-line flex flex-col lg:sticky lg:top-0 lg:h-screen">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-3 rounded-sm">
              <img src="/brand/logo-mark-128.png" width={141} height={128} alt="" className="h-9 w-auto" />
              <span className="leading-none">
                <span className="block font-display font-black text-sm tracking-[0.18em] text-ink">ROSID</span>
                <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted mt-0.5">Admin</span>
              </span>
            </Link>
            <a href="/" target="_blank" rel="noopener" className="lg:hidden btn-ghost btn-sm" aria-label="Open live website in a new tab">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label="Admin" className="flex-1 p-3 overflow-x-auto lg:overflow-y-auto">
            <ul className="flex lg:flex-col gap-1 lg:gap-4">
              {groups.map((g) => (
                <li key={g.label} className="shrink-0">
                  <p className="hidden lg:block px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{g.label}</p>
                  <ul className="flex lg:flex-col gap-1">
                    {g.items.map((item) => (
                      <li key={item.href} className="shrink-0">
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-semibold whitespace-nowrap transition-colors duration-fast ${
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
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block p-4 border-t border-line space-y-3">
            <div className="text-xs">
              <p className="text-muted truncate" title={user?.email ?? ''}>{user?.email}</p>
              <p className="mt-0.5 inline-block px-2 py-0.5 rounded-sm bg-canvas border border-line font-semibold text-ink capitalize">{role}</p>
            </div>
            <a href="/" target="_blank" rel="noopener" className="btn-secondary btn-sm w-full">
              Live website <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
            <button type="button" onClick={signOut} className="btn-ghost btn-sm w-full justify-start">
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" aria-hidden="true" /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-line bg-surface">
            <span className="text-xs text-muted truncate mr-auto">{user?.email} · <span className="capitalize">{role}</span></span>
            <button type="button" onClick={signOut} className="btn-ghost btn-sm">Sign out</button>
          </div>
          {children}
        </div>
      </div>
    </ConfirmProvider>
  )
}
