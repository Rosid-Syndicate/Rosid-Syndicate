import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const pillars = [
  { n: '01', t: 'Financial & guarantees', d: 'Counter-guarantee set-up, local bank syndication and financial closure through Appi Saipal Financial Solutions.' },
  { n: '02', t: 'Regulatory & representation', d: 'Local agent alignment, Public Procurement Act compliance and government liaison.' },
  { n: '03', t: 'Civil & supply logistics', d: 'Bulk material sourcing, equipment logistics and joint-venture site execution.' },
]

export default function ForeignContractor() {
  return (
    <section className="py-20 lg:py-28 bg-ink text-white" aria-labelledby="foreign-heading">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <p className="eyebrow eyebrow-on-dark">Foreign contractor support</p>
            <h2 id="foreign-heading" className="mt-5 text-h2 text-white">Your in-country execution partner in Nepal.</h2>
            <p className="mt-6 text-lead text-slate-300">
              Nepal's infrastructure pipeline offers real opportunity, but foreign firms meet friction: Public Procurement Act requirements, local bank-guarantee compliance and on-the-ground logistics.
            </p>
            <p className="mt-4 text-base text-slate-300">
              Rosid Syndicates Group acts as the operational, financial and strategic counterpart so that an international bidder can focus on engineering and pricing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/infrastructure-tender-services" className="btn-accent">
                Read the foreign contractor workflow <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/tender-inquiry" className="btn-outline-light">Submit a tender inquiry</Link>
            </div>
          </div>

          <ol className="lg:col-span-6 space-y-4" aria-label="Three pillars">
            {pillars.map((p) => (
              <li key={p.n} className="panel-dark p-6 flex gap-5">
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-sm bg-accent text-ink font-mono font-bold text-sm" aria-hidden="true">{p.n}</span>
                <div>
                  <h3 className="text-h3 text-white">{p.t}</h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
