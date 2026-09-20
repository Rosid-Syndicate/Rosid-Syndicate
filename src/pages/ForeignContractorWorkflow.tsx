import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'

const pillars = [
  {
    n: '01',
    tag: 'Financial',
    title: 'Counter-guarantees & bank alignment',
    intro: 'Through Appi Saipal Financial Solutions we interface with Class "A" commercial banks and Nepal Rastra Bank for the guarantee structures a bid requires:',
    items: ['Bid bonds', 'Performance bonds', 'Advance-payment counter-guarantees', 'Bank alignment and financial closure'],
  },
  {
    n: '02',
    tag: 'Regulatory',
    title: 'Compliant local representation',
    intro: 'We navigate the compliance required to secure and execute public tenders:',
    items: ['Local representation and JV structuring', 'Public Procurement Regulations alignment', 'Government advocacy and policy support', 'Local partner preference management'],
  },
  {
    n: '03',
    tag: 'Logistics',
    title: 'On-the-ground logistics & material supply',
    intro: 'Roshan Enterprises and the commerce division handle physical execution:',
    items: ['Bulk domestic raw-material sourcing', 'Local labour network management', 'Site management support', 'Integrated construction execution'],
  },
]

export default function ForeignContractorWorkflow() {
  return (
    <div className="bg-canvas">
      <Seo
        title="Foreign Contractor Support in Nepal"
        description="How Rosid Syndicates Group supports foreign contractors bidding on infrastructure tenders in Nepal: counter-guarantees and bank alignment, Public Procurement Act compliance and local representation, and material supply with site logistics."
        path="/infrastructure-tender-services"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Foreign Contractor Support', path: '/infrastructure-tender-services' }]}
      />
      <PageHeader
        title="Bidding and executing in Nepal as a foreign contractor."
        subtitle="Foreign contractor workflow"
        lead="One in-country counterpart for guarantees, compliance and site execution — so your team can focus on engineering and pricing."
        image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
      />

      {/* Challenge */}
      <section className="py-16 lg:py-24 border-b border-line" aria-labelledby="challenge-heading">
        <div className="container max-w-3xl">
          <p className="eyebrow">The challenge</p>
          <h2 id="challenge-heading" className="mt-5 text-h2">A growing market with specific entry requirements.</h2>
          <p className="mt-6 text-lead text-muted">
            Foreign firms entering Nepal's infrastructure sector face Public Procurement Act (PPA) requirements, local bank-guarantee compliance, regulatory navigation, local representation rules and on-the-ground execution logistics.
          </p>
        </div>
      </section>

      {/* Role diagram */}
      <section className="py-16 lg:py-24" aria-labelledby="role-heading">
        <div className="container max-w-4xl">
          <h2 id="role-heading" className="text-h2 text-center">Rosid's role as your in-country execution engine</h2>
          <ol className="mt-12 flex flex-col items-center" aria-label="Relationship between bidder, Rosid and the three pillars">
            <li className="w-full max-w-sm card px-6 py-4 text-center font-bold tracking-wide text-ink">Foreign contractor / bidder</li>
            <li aria-hidden="true" className="w-px h-10 bg-accent" />
            <li className="w-full max-w-md bg-accent text-ink px-6 py-4 rounded-sm text-center shadow-card">
              <span className="block font-bold tracking-wide">Rosid Syndicates Group</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.1em] mt-1 text-ink/80">In-country execution engine</span>
            </li>
            <li aria-hidden="true" className="w-px h-10 bg-accent" />
            <li className="w-full">
              <ul className="grid sm:grid-cols-3 gap-4 border-t-2 border-line pt-6">
                {pillars.map((p) => (
                  <li key={p.n} className="card p-5 text-center">
                    <span className="block font-mono text-xs text-accent-text">{p.n}</span>
                    <span className="block mt-1 font-bold text-ink text-sm uppercase tracking-wide">{p.title.split(' & ')[0]}</span>
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 lg:py-24 bg-surface border-y border-line" aria-labelledby="pillars-heading">
        <div className="container">
          <h2 id="pillars-heading" className="sr-only">The three pillars in detail</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <section key={p.n} className="card p-8" aria-labelledby={`pillar-${p.n}`}>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-accent-text">{p.n} / {p.tag}</span>
                <h3 id={`pillar-${p.n}`} className="mt-3 text-h3 pb-5 border-b border-line">{p.title}</h3>
                <p className="mt-5 text-sm text-muted leading-relaxed">{p.intro}</p>
                <ul className="mt-4 space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-ink">
                      <CheckIcon className="w-4 h-4 mt-0.5 text-accent-text shrink-0" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 lg:py-24" aria-labelledby="why-partner">
        <div className="container max-w-3xl">
          <p className="eyebrow">Why partner with us</p>
          <h2 id="why-partner" className="mt-5 text-h2">Bridging global expertise and Nepalese execution.</h2>
          <p className="mt-6 text-lead text-muted">
            The advantage lies in one ecosystem: financial advisory, material supply, logistics and regulatory navigation from a single group, which removes the friction of operating in a new jurisdiction and lets you concentrate on high-value engineering and bidding.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-ink text-white" aria-labelledby="fc-cta">
        <div className="container max-w-4xl text-center">
          <h2 id="fc-cta" className="text-h2 text-white">Preparing a bid in Nepal?</h2>
          <p className="mt-5 text-lead text-slate-300">Share the tender reference and required support. We respond with the relevant division within two working days.</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/tender-inquiry" className="btn-accent">
              Submit a tender inquiry <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/#contact" className="btn-outline-light">Discuss a JV partnership</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
