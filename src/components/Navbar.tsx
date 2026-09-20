import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

/**
 * Global navigation.
 *
 * Every destination is a real <a href> (previously all items were <button>s, so
 * search engines saw zero internal links in the header and users could not
 * open pages in a new tab). Dropdowns are disclosure widgets: they open on
 * click/Enter/Space and on hover for mouse users, close on Escape, on outside
 * click and when focus leaves; state is exposed with aria-expanded/aria-controls.
 */

type Item = { label: string; to: string; description?: string }
type Group = { label: string; items: Item[] }
type Entry = Item | Group

const NAV: Entry[] = [
  { label: 'About', to: '/#about' },
  {
    label: 'Our group',
    items: [
      { label: 'Subsidiaries', to: '/companies', description: 'Five operating companies' },
      { label: 'Group structure', to: '/group-structure', description: 'Divisions and governance' },
      { label: 'Corporate profile', to: '/corporate-profile', description: 'Official overview' },
      { label: 'Credentials', to: '/credentials', description: 'Registrations and licences' },
    ],
  },
  {
    label: 'Capabilities',
    items: [
      { label: 'Foreign contractor support', to: '/infrastructure-tender-services', description: 'JV, guarantees, local execution' },
      { label: 'Procurement & tenders', to: '/procurement', description: 'Public and private supply' },
      { label: 'Financial advisory', to: '/companies/appi-saipal-financial-solutions', description: 'Bank syndication & closure' },
      { label: 'Sectors', to: '/projects', description: 'Where we operate' },
    ],
  },
  { label: 'Insights', to: '/blog' },
]

const isGroup = (e: Entry): e is Group => 'items' in e

function DesktopDropdown({ group, isOpen, onOpen, onClose }: { group: Group; isOpen: boolean; onOpen: () => void; onClose: () => void }) {
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(onClose, 120)
  }
  const cancelClose = () => window.clearTimeout(closeTimer.current)

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { cancelClose(); onOpen() }}
      onMouseLeave={scheduleClose}
      onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) onClose() }}
    >
      <button
        type="button"
        className="nav-item"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); onOpen(); window.setTimeout(() => ref.current?.querySelector<HTMLElement>('a')?.focus(), 0) }
        }}
      >
        {group.label}
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id={id}
        role="region"
        aria-label={group.label}
        hidden={!isOpen}
        className="absolute left-0 top-full pt-3 w-72"
      >
        <ul className="card shadow-raised py-2">
          {group.items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `block px-5 py-3 hover:bg-canvas focus-visible:bg-canvas ${isActive ? 'text-accent-text' : 'text-ink'}`}
              >
                <span className="block text-sm font-bold">{item.label}</span>
                {item.description && <span className="block text-xs text-muted mt-0.5">{item.description}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const mobileId = useId()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false)
    setOpenGroup(null)
  }, [location.pathname, location.hash])

  // Escape closes; outside click closes
  const closeAll = useCallback(() => { setMobileOpen(false); setOpenGroup(null) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll() }
    const onClick = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) closeAll() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [closeAll])

  // Prevent background scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.documentElement.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-line transition-shadow duration-base ${scrolled ? 'shadow-card' : ''}`}
    >
      <nav aria-label="Primary" className={`container flex items-center justify-between gap-6 transition-[padding] duration-base ${scrolled ? 'py-3' : 'py-4'}`}>
        <Link to="/" className="flex items-center gap-3 shrink-0 rounded-sm">
          <picture>
            <source type="image/webp" srcSet="/brand/logo-mark-128.webp 1x, /brand/logo-mark-192.webp 1.5x" />
            <img
              src="/brand/logo-mark-128.png"
              srcSet="/brand/logo-mark-128.png 1x, /brand/logo-mark-192.png 1.5x"
              width={128}
              height={128}
              alt=""
              className={`w-auto transition-[height] duration-base ${scrolled ? 'h-11' : 'h-14'}`}
            />
          </picture>
          <span className="block leading-none">
            <span className="block font-display font-black text-base sm:text-lg tracking-[0.18em] text-ink">ROSID</span>
            <span className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase text-muted mt-1">Syndicates Group</span>
            <span className="sr-only">, home</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <DesktopDropdown
                key={entry.label}
                group={entry}
                isOpen={openGroup === entry.label}
                onOpen={() => setOpenGroup(entry.label)}
                onClose={() => setOpenGroup((g) => (g === entry.label ? null : g))}
              />
            ) : (
              <NavLink key={entry.to} to={entry.to} className={({ isActive }) => `nav-item ${isActive && !entry.to.includes('#') ? 'text-accent-text' : ''}`}>
                {entry.label}
              </NavLink>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/tender-inquiry" className="btn-secondary btn-sm">Tender inquiry</Link>
          <Link to="/#contact" className="btn-primary btn-sm">Contact us</Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-sm text-ink"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls={mobileId}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="relative block w-6 h-4" aria-hidden="true">
            <span className={`absolute left-0 top-0 block w-6 h-0.5 bg-current transition-transform duration-base ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`absolute left-0 top-[7px] block w-6 h-0.5 bg-current transition-opacity duration-base ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 top-[14px] block w-6 h-0.5 bg-current transition-transform duration-base ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      {/* Mobile panel */}
      <div id={mobileId} hidden={!mobileOpen} className="lg:hidden border-t border-line bg-white max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
        <nav aria-label="Primary mobile" className="container py-4">
          <ul className="divide-y divide-line">
            {NAV.map((entry) => (
              <li key={entry.label} className="py-2">
                {isGroup(entry) ? (
                  <>
                    <p className="px-2 pt-2 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">{entry.label}</p>
                    <ul>
                      {entry.items.map((item) => (
                        <li key={item.to}>
                          <NavLink to={item.to} className="block px-2 py-3 text-base font-semibold text-ink hover:text-accent-text">
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink to={entry.to} className="block px-2 py-3 text-base font-semibold text-ink hover:text-accent-text">
                    {entry.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/tender-inquiry" className="btn-secondary">Tender inquiry</Link>
            <Link to="/#contact" className="btn-primary">Contact us</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
