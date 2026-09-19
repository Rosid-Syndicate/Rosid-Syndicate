import { Link, useParams } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { findService, services } from '../data/services'
import { companies } from '../data/companies'
import { SITE_URL } from '../config/site'

// Legacy URL-encoded names (e.g. /service/financial%20advisory) → slugs
const legacySlugMap: Record<string, string> = {
  'construction & civil infrastructure': 'construction-civil-infrastructure',
  'procurement & tender execution': 'procurement-tender-execution',
  'financial advisory': 'financial-advisory',
  'international trade': 'international-trade',
  'supply chain & logistics': 'supply-chain-logistics',
  'foreign contractor support': 'foreign-contractor-support',
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const decoded = decodeURIComponent(slug || '').toLowerCase()
  const service = findService(legacySlugMap[decoded] || decoded)

  if (!service) {
    return <NotFound title="Service not found" message="We could not find that capability page." backTo="/#companies" backLabel="All capabilities" />
  }

  const deliveredBy = companies.filter((c) => service.companies.includes(c.slug))
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3)

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    url: `${SITE_URL}/service/${service.slug}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    serviceType: service.title,
  }

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title={service.title}
        description={service.description}
        path={`/service/${service.slug}`}
        image={service.image}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Capabilities', path: '/#companies' },
          { name: service.title, path: `/service/${service.slug}` },
        ]}
        jsonLd={serviceJsonLd}
      />
      <PageHeader title={service.title} subtitle="Capability" lead={service.short} image={service.image} backLink="/#companies" backLabel="All capabilities" />

      <div className="container py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <article className="lg:col-span-7 prose-body">
            {service.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>

          <aside className="lg:col-span-5 space-y-6">
            <div className="card p-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Delivered by</h2>
              <ul className="mt-4 divide-y divide-line">
                {deliveredBy.map((c) => (
                  <li key={c.slug} className="py-3">
                    <Link to={`/companies/${c.slug}`} className="group flex items-start justify-between gap-4">
                      <span>
                        <span className="block font-bold text-ink group-hover:text-accent-text">{c.name}</span>
                        <span className="block text-sm text-muted mt-0.5">{c.shortDescription}</span>
                      </span>
                      <ArrowRightIcon className="w-4 h-4 mt-1 shrink-0 text-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Related</h2>
              <ul className="mt-4 space-y-2">
                {service.related.map((r) => (
                  <li key={r.to}>
                    <Link to={r.to} className="link-arrow">{r.label} →</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink text-white p-6 rounded-sm">
              <h2 className="text-h3 text-white">Discuss a requirement</h2>
              <p className="mt-2 text-sm text-slate-300">Tell us about the project, quantities and timeline; the relevant company replies by email.</p>
              <Link to="/#contact" className="btn-accent mt-5 w-full">Contact us</Link>
            </div>
          </aside>
        </div>

        <nav aria-label="Other capabilities" className="mt-20 pt-10 border-t border-line">
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted mb-6">Other capabilities</h2>
          <ul className="grid sm:grid-cols-3 gap-5">
            {others.map((s) => (
              <li key={s.slug}>
                <Link to={`/service/${s.slug}`} className="card card-hover block p-6 h-full">
                  <span className="block font-bold text-ink">{s.title}</span>
                  <span className="block text-sm text-muted mt-2">{s.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
