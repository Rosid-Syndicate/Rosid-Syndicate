import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { companies } from '../data/companies'
import { CONTACT, SITE_NAME } from '../config/site'
import SocialLinks from './SocialLinks'

const capabilities = [
  { label: 'Foreign contractor support', to: '/infrastructure-tender-services' },
  { label: 'Procurement & tenders', to: '/procurement' },
  { label: 'Financial advisory', to: '/companies/appi-saipal-financial-solutions' },
  { label: 'Sectors we serve', to: '/projects' },
  { label: 'Group structure', to: '/group-structure' },
  { label: 'Insights & news', to: '/blog' },
]

const legal = [
  { label: 'Corporate profile', to: '/corporate-profile' },
  { label: 'Credentials', to: '/credentials' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Terms & conditions', to: '/terms-conditions' },
  { label: 'Cookie policy', to: '/cookie-policy' },
]

/**
 * Site footer. All links are real routes (the previous footer used
 * hash-router URLs like "/#/blog" that resolved to the home page under
 * BrowserRouter, and three company slugs that did not exist). Company links are
 * derived from the same data file the pages use, so they cannot drift.
 */
export default function Footer() {
  return (
    <footer className="bg-deep text-slate-300 border-t border-white/10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="container pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 rounded-sm">
              <picture>
                <source type="image/webp" srcSet="/brand/logo-mark-128.webp" />
                <img src="/brand/logo-mark-128.png" width={128} height={128} alt="" className="h-12 w-auto bg-white rounded-sm p-1" />
              </picture>
              <span className="leading-none">
                <span className="block font-display font-black text-lg tracking-[0.18em] text-white">ROSID</span>
                <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mt-1">Syndicates Group</span>
                <span className="sr-only">, home</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              A Kathmandu-based group of five companies working across construction supply, public procurement, financial advisory and cross-border trade in Nepal.
            </p>
            <SocialLinks className="-ml-3" />
          </div>

          <nav className="lg:col-span-3" aria-labelledby="footer-companies">
            <h3 id="footer-companies" className="text-xs font-bold tracking-[0.14em] uppercase text-white mb-5">Companies</h3>
            <ul className="space-y-3">
              {companies.map((c) => (
                <li key={c.slug}>
                  <Link to={`/companies/${c.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors duration-fast">
                    {c.name.replace(/ Pvt\. Ltd\.$/, '')}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/companies" className="text-sm font-semibold text-accent hover:text-white transition-colors duration-fast">All companies →</Link>
              </li>
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-labelledby="footer-capabilities">
            <h3 id="footer-capabilities" className="text-xs font-bold tracking-[0.14em] uppercase text-white mb-5">Capabilities</h3>
            <ul className="space-y-3">
              {capabilities.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors duration-fast">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold tracking-[0.14em] uppercase text-white mb-5">Contact</h3>
            <address className="not-italic">
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <span>{CONTACT.addressLine}</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <a href={CONTACT.phoneHref} className="hover:text-white transition-colors duration-fast">{CONTACT.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors duration-fast break-all">{CONTACT.email}</a>
                </li>
              </ul>
            </address>
            <Link to="/#contact" className="btn-accent btn-sm mt-6">Send an inquiry</Link>
          </div>
        </div>

        {/* Legal bar: copyright · agency credit · legal links on one line from xl; stacks below that. */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
          <p className="text-xs text-slate-400 xl:shrink-0 xl:whitespace-nowrap" suppressHydrationWarning>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="text-xs text-slate-400 xl:shrink-0 xl:whitespace-nowrap">
            Website by{' '}
            <a
              href="https://www.tradiedigitalagency.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold whitespace-nowrap text-accent underline-offset-4 transition duration-fast hover:brightness-110 hover:underline rounded-sm"
            >
              Tradie Digital Agency<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <nav aria-label="Legal" className="xl:shrink-0">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 xl:flex-nowrap">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs font-semibold whitespace-nowrap text-slate-400 hover:text-white transition-colors duration-fast">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
