import { Link, useParams } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import { companies } from '../data/companies'
import { services } from '../data/services'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { SITE_URL } from '../config/site'

export default function CompanyDetail() {
  const { slug } = useParams()
  const company = companies.find((c) => c.slug === slug)

  if (!company) {
    return <NotFound title="Company not found" message="That company page does not exist. Browse the five operating companies instead." backTo="/companies" backLabel="All companies" />
  }

  const related = services.filter((s) => s.companies.includes(company.slug))
  const headerImage = company.image.startsWith('/') ? 'https://images.unsplash.com/photo-1497366216548-37526070297c' : company.image

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: `${SITE_URL}/companies/${company.slug}`,
    description: company.shortDescription,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    address: { '@type': 'PostalAddress', addressCountry: 'NP' },
  }

  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title={company.name}
        description={`${company.shortDescription} ${company.coreScope}. A Rosid Syndicates Group company, Nepal.`}
        path={`/companies/${company.slug}`}
        image={headerImage}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Group Companies', path: '/companies' },
          { name: company.name, path: `/companies/${company.slug}` },
        ]}
        jsonLd={orgJsonLd}
      />
      <PageHeader title={company.name} subtitle="Group company" lead={company.shortDescription} image={headerImage} backLink="/companies" backLabel="All companies" />

      <div className="container py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <section className="card p-6 sm:p-8" aria-labelledby="scope-heading">
              <h2 id="scope-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Core scope</h2>
              <p className="mt-3 text-xl sm:text-2xl text-ink font-medium leading-snug">{company.coreScope}</p>
            </section>

            <section className="mt-12" aria-labelledby="capabilities-heading">
              <h2 id="capabilities-heading" className="text-h2">Capabilities &amp; focus areas</h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {company.services.map((service) => (
                  <li key={service} className="flex items-start gap-3 p-4 bg-surface border border-line rounded-sm">
                    <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-accent-soft text-accent-text shrink-0" aria-hidden="true">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-ink leading-relaxed">{service}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            {related.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Group capabilities delivered</h2>
                <ul className="mt-4 space-y-2">
                  {related.map((s) => (
                    <li key={s.slug}>
                      <Link to={`/service/${s.slug}`} className="link-arrow">{s.title} →</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-ink text-white p-6 rounded-sm">
              <h2 className="text-h3 text-white">Work with {company.name.replace(/ Pvt\. Ltd\.$/, '')}</h2>
              <p className="mt-2 text-sm text-slate-300">Share your requirement and the company team will respond by email.</p>
              <Link to="/#contact" className="btn-accent mt-5 w-full">
                Discuss a project <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
