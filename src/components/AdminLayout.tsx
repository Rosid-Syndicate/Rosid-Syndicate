import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Blog Posts', href: '/admin/blog' },
  { name: 'Categories', href: '/admin/categories' },
  { name: 'Inquiries', href: '/admin/inquiries' },
  { name: 'Companies', href: '/admin/companies' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Credentials', href: '/admin/credentials' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-slate-600 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Rosid Syndicates Group Logo" className="h-9 w-auto object-contain" />
            <span className="text-lg font-display font-black tracking-widest text-ink uppercase group-hover:text-fire transition-colors">ROSID SYNDICATES ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 rounded-sm text-sm font-bold tracking-widest uppercase transition-colors ${
                  isActive 
                    ? 'bg-fire text-[#0f172a]' 
                    : 'text-slate-500 hover:text-ink hover:bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={signOut}
            className="w-full px-4 py-3 text-sm font-bold tracking-widest uppercase text-slate-500 hover:text-fire hover:bg-white border border-slate-200 shadow-sm rounded-sm transition-colors text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
