import { Link } from 'react-router-dom'
import { companies } from '../data/companies'

/**
 * "At a glance" band.
 *
 * Replaces animated count-up statistics ("100+ global partners", "150+ projects",
 * "40+ years", "2000+ workforce") that had no source anywhere in the repository
 * or on the site. Every figure below is derived from the site's own data and
 * can be verified by the reader on the linked page. If the business can
 * substantiate the previous figures, they belong on the Credentials page with
 * their evidence — see WEBSITE_AUDIT.md (business decisions).
 */
const facts = [
  { value: String(companies.length), label: 'operating companies', to: '/companies' },
  { value: '2', label: 'business divisions', to: '/group-structure' },
  { value: 'Kathmandu', label: 'head office, Nepal', to: '/corporate-profile' },
  { value: 'Domestic & foreign', label: 'developers and contractors served', to: '/infrastructure-tender-services' },
]

export default function Stats() {
  return (
    <section className="bg-ink text-white border-y border-white/10" aria-label="Group at a glance">
      <div className="container">
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-white/10 lg:divide-x">
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col py-8 lg:py-10 lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <dt className="order-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{f.label}</dt>
              <dd className="order-1 text-2xl lg:text-3xl font-bold text-white tabular-nums tracking-tight mb-1">
                <Link to={f.to} className="hover:text-accent transition-colors duration-fast rounded-sm">{f.value}</Link>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
