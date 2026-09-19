import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Seo from '../components/Seo'
import { SITE_URL } from '../config/site'

const processSteps = [
  { title: 'Project development', desc: 'Initial feasibility and planning' },
  { title: 'Financial structuring', desc: 'Debt-equity modelling and NRB compliance' },
  { title: 'Bank syndication', desc: 'Mobilising Class "A" bank consortiums' },
  { title: 'Guarantee & risk architecture', desc: 'Counter-guarantees and tripartite assurances' },
  { title: 'Financial closure', desc: 'Finalising syndicated facilities' },
  { title: 'Project execution', desc: 'Construction commencement and DSCR monitoring' },
]

const serviceGroups = [
  {
    title: 'Consortium bank syndication & debt structuring',
    items: [
      ['Lead arrangement support', 'Structuring debt-equity ratios compliant with Nepal Rastra Bank directives and project cash-flow models.'],
      ['Consortium facilitation', 'Mobilising Class "A" commercial banks and financial institutions into syndicated loan facilities for large capital expenditure.'],
      ['Refinancing & equity advisory', 'Structuring bridge financing, mezzanine capital and equity-partner alignment for mid-stage developers.'],
    ],
  },
  {
    title: 'Tripartite assurance & risk mitigation',
    items: [
      ['Debt-servicing assurance', 'Independent operational intermediary aligning project milestones with bank repayment schedules.'],
      ['Beneficiary protection', 'Transparent escrow monitoring and performance-linked disbursements.'],
      ['Default prevention', 'Continuous covenant monitoring to prevent DSCR breaches during construction.'],
    ],
  },
  {
    title: 'Foreign contractor facilities & counter-guarantees',
    items: [
      ['Counter-guarantee structuring', 'Support for cross-border bank guarantees: bid bonds, performance bonds and advance-payment guarantees.'],
      ['Foreign-exchange compliance', 'Navigating foreign-currency approvals, offshore equipment procurement and repatriation of project earnings.'],
      ['Cross-border trade structuring', 'Letter-of-credit facilities and turbine, generator and transmission-tower imports in coordination with B & C Exim.'],
    ],
  },
  {
    title: 'Policy reform & government advocacy',
    items: [
      ['Regulatory liaison', 'Advisory coordination with the Ministry of Energy, Water Resources and Irrigation (MoEWRI), the Electricity Regulatory Commission (ERC) and the Nepal Electricity Authority (NEA).'],
      ['Legal framework advisory', 'Strategic advisory on concession agreements, transmission wheeling charges and infrastructure lending caps.'],
    ],
  },
]

const comparison = [
  ['Banking network', 'Purely transactional referral', 'Direct consortium syndication with established NRB compliance frameworks'],
  ['Cross-border reach', 'Domestic focus only', 'Integrated counter-guarantees for foreign EPC firms entering Nepal'],
  ['Group ecosystem', 'Standalone advisory firm', "Backed by Rosid Syndicates Group's civil execution and material-supply network"],
  ['Regulatory policy', 'Passive compliance', 'Active advocacy for sectoral policy improvements'],
]

export default function AppiSaipal() {
  const path = '/companies/appi-saipal-financial-solutions'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Appi Saipal Financial Solutions Pvt. Ltd.',
    url: `${SITE_URL}${path}`,
    description: 'Capital structuring, bank syndication and risk assurance for hydropower and transmission projects in Nepal.',
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    serviceType: ['Bank syndication', 'Financial closure advisory', 'Counter-guarantee structuring'],
  }

  return (
    <div className="bg-canvas">
      <Seo
        title="Appi Saipal Financial Solutions"
        description="Appi Saipal Financial Solutions Pvt. Ltd. — capital structuring, Class A bank syndication, counter-guarantees and financial closure for hydropower and transmission projects in Nepal. A Rosid Syndicates Group company."
        path={path}
        image="/img/hydropower-plant-1024.jpg"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Group Companies', path: '/companies' },
          { name: 'Appi Saipal Financial Solutions', path },
        ]}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative bg-ink text-white overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-28" aria-labelledby="appi-heading">
        <picture>
          <source type="image/webp" srcSet="/img/hydropower-plant-640.webp 640w, /img/hydropower-plant-1024.webp 1024w, /img/hydropower-plant-1376.webp 1376w" sizes="100vw" />
          <img src="/img/hydropower-plant-1024.jpg" alt="" aria-hidden="true" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />
        <div className="container relative">
          <Link to="/companies" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white mb-8 rounded-sm">← All companies</Link>
          <p className="eyebrow eyebrow-on-dark">A Rosid Syndicates Group company</p>
          <h1 id="appi-heading" className="mt-4 text-display text-white max-w-4xl">Appi Saipal Financial Solutions Pvt. Ltd.</h1>
          <p className="mt-5 text-xl md:text-2xl text-accent font-semibold max-w-3xl">Hydropower &amp; transmission-line financial advisory</p>
          <p className="mt-4 text-lead text-slate-300 max-w-2xl">Capital structuring, bank syndication and risk assurance for Nepal's energy sector.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link to="/#contact" className="btn-accent">
              Schedule a financial-closure consultation <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/tender-inquiry" className="btn-outline-light">Request the advisory profile</Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 lg:py-24 border-b border-line" aria-labelledby="focus-heading">
        <div className="container grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="eyebrow">Energy infrastructure focus</p>
            <h2 id="focus-heading" className="mt-5 text-h2">De-risking energy projects from concept to grid connection.</h2>
            <div className="mt-6 prose-body">
              <p>Developing hydropower assets and high-voltage transmission corridors in Nepal requires robust financial architecture, local banking-consortium alignment and multi-stakeholder governance.</p>
              <p>Appi Saipal Financial Solutions connects developers, Class "A" commercial banks, international EPC contractors and state energy authorities to keep projects bankable and executing.</p>
            </div>
          </div>
          <figure className="lg:col-span-6 card p-3">
            <picture>
              <source type="image/webp" srcSet="/img/hydropower-plant-640.webp 640w, /img/hydropower-plant-1024.webp 1024w" sizes="(min-width: 1024px) 45vw, 100vw" />
              <img src="/img/hydropower-plant-1024.jpg" width={1024} height={571} loading="lazy" decoding="async" alt="Hydropower plant and transmission substation" className="w-full aspect-[16/9] object-cover rounded-sm" />
            </picture>
            <figcaption className="p-4 text-sm text-muted">
              <strong className="text-ink">Focus area:</strong> hydropower and high-voltage transmission advisory — capital structuring and bank-consortium syndication.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 lg:py-24" aria-labelledby="advisory-heading">
        <div className="container">
          <h2 id="advisory-heading" className="text-h2 max-w-3xl">Advisory services</h2>
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            {serviceGroups.map((g) => (
              <section key={g.title} className="card p-8" aria-labelledby={`sg-${g.title.slice(0, 12).replace(/\W/g, '')}`}>
                <h3 id={`sg-${g.title.slice(0, 12).replace(/\W/g, '')}`} className="text-h3 pb-4 border-b border-line">{g.title}</h3>
                <dl className="mt-6 space-y-6">
                  {g.items.map(([t, d]) => (
                    <div key={t}>
                      <dt className="font-bold text-ink">{t}</dt>
                      <dd className="mt-1.5 text-sm text-muted leading-relaxed">{d}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 lg:py-24 bg-surface border-y border-line" aria-labelledby="closure-heading">
        <div className="container">
          <div className="max-w-2xl">
            <p className="eyebrow">Process</p>
            <h2 id="closure-heading" className="mt-5 text-h2">Financial-closure pathway</h2>
            <p className="mt-4 text-lead text-muted">A structured route from development to execution.</p>
          </div>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processSteps.map((step, i) => (
              <li key={step.title} className="relative card p-6 pl-16">
                <span className="absolute left-6 top-6 grid place-items-center w-8 h-8 rounded-sm bg-ink text-white text-xs font-bold font-mono" aria-hidden="true">0{i + 1}</span>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 lg:py-24" aria-labelledby="why-heading">
        <div className="container">
          <h2 id="why-heading" className="text-h2 max-w-3xl">Why energy developers work with Appi Saipal</h2>
          <div className="mt-10 overflow-x-auto card">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <caption className="sr-only">Comparison of a standard advisory engagement with the Appi Saipal approach</caption>
              <thead>
                <tr className="bg-canvas">
                  <th scope="col" className="p-5 text-xs font-bold uppercase tracking-[0.1em] text-muted border-b border-line w-1/4">Dimension</th>
                  <th scope="col" className="p-5 text-xs font-bold uppercase tracking-[0.1em] text-muted border-b border-l border-line">Standard financial advisory</th>
                  <th scope="col" className="p-5 text-xs font-bold uppercase tracking-[0.1em] text-accent-text border-b border-l border-line">Appi Saipal approach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comparison.map(([dim, std, appi]) => (
                  <tr key={dim}>
                    <th scope="row" className="p-5 font-bold text-ink text-left align-top">{dim}</th>
                    <td className="p-5 text-muted border-l border-line align-top">{std}</td>
                    <td className="p-5 text-ink font-medium border-l border-line bg-accent-soft/40 align-top">{appi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-ink text-white" aria-labelledby="appi-cta">
        <div className="container max-w-4xl text-center">
          <h2 id="appi-cta" className="text-h2 text-white">Accelerate your energy project's capital structuring.</h2>
          <p className="mt-6 text-lead text-slate-300">Supporting domestic developers preparing for financial closure and international contractors bidding on cross-border transmission lines.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/#contact" className="btn-accent">
              Schedule a consultation <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/tender-inquiry" className="btn-outline-light">Request the advisory profile</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
