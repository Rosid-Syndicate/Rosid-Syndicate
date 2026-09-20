import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { companies } from '../data/companies'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'

const divisions = [
  {
    key: 'infrastructure',
    name: 'Infrastructure & advisory',
    summary: 'Energy developments, counter-guarantees and EPC financial structures.',
    slugs: ['appi-saipal-financial-solutions'],
  },
  {
    key: 'commerce',
    name: 'Commerce & logistics',
    summary: 'Cross-border import/export, commercial supply tenders and warehousing.',
    slugs: ['roshan-enterprises', 'kasthamandap-commerce', 'b-c-exim', 'deiyougo-enterprises'],
  },
]

export default function GroupStructure() {
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Group Structure"
        description="How Rosid Syndicates Group is organised: a group board directing two divisions — Infrastructure & Advisory (Appi Saipal Financial Solutions) and Commerce & Logistics (Roshan Enterprises, Kasthamandap Commerce, B & C Exim, Deiyougo Enterprises)."
        path="/group-structure"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Group Structure', path: '/group-structure' }]}
      />
      <PageHeader
        title="Group structure"
        subtitle="Organisation"
        lead="A group board directs two operating divisions. Each subsidiary keeps its own management and licences; the group coordinates finance, supply and execution across them."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
      />

      <section className="py-16 lg:py-24" aria-labelledby="chart-heading">
        <div className="container max-w-6xl">
          <h2 id="chart-heading" className="sr-only">Organisation chart</h2>

          <div className="flex flex-col items-center">
            <div className="card w-full max-w-md text-center p-6 border-t-4 border-t-accent">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent-text">Group board</span>
              <p className="mt-2 text-xl font-bold text-ink">Rosid Syndicates Group</p>
              <p className="mt-1 text-sm text-muted">Strategic governance and multi-sector policy oversight</p>
            </div>
            <div className="w-px h-10 bg-line" aria-hidden="true" />
            <div className="hidden md:block w-1/2 h-px bg-line" aria-hidden="true" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 md:mt-0 mt-2">
            {divisions.map((d) => {
              const members = companies.filter((c) => d.slugs.includes(c.slug))
              return (
                <section key={d.key} className="flex flex-col items-center" aria-labelledby={`div-${d.key}`}>
                  <div className="hidden md:block w-px h-10 bg-line" aria-hidden="true" />
                  <div className="w-full bg-ink text-white p-5 rounded-sm">
                    <h3 id={`div-${d.key}`} className="text-h3 text-white">{d.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{d.summary}</p>
                  </div>
                  <ul className="w-full mt-4 space-y-3">
                    {members.map((c) => (
                      <li key={c.slug}>
                        <Link to={`/companies/${c.slug}`} className="group card card-hover block p-5">
                          <span className="flex items-start justify-between gap-4">
                            <span>
                              <span className="block font-bold text-ink group-hover:text-accent-text transition-colors duration-fast">{c.name}</span>
                              <span className="block text-sm text-muted mt-1">{c.shortDescription}</span>
                              <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent-text bg-accent-soft px-2 py-1 rounded-sm">
                                {c.coreScope.split(',')[0]}
                              </span>
                            </span>
                            <ArrowRightIcon className="w-4 h-4 mt-1 shrink-0 text-muted group-hover:text-accent-text" aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-surface border-t border-line" aria-labelledby="engine-heading">
        <div className="container max-w-3xl text-center">
          <h2 id="engine-heading" className="text-h2">One execution system</h2>
          <p className="mt-5 text-lead text-muted">
            The two-division structure lets the group structure financial safeguards, syndicate funding, coordinate border logistics and manage site execution for the same project — closing delivery gaps between finance, supply and works.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/corporate-profile" className="btn-primary">View corporate profile</Link>
            <Link to="/companies" className="btn-secondary">Explore the companies</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
