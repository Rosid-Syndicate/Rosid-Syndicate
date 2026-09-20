import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import PageHeader from '../components/PageHeader'
import Seo from '../components/Seo'

const capabilities = [
  { title: 'Public-sector procurement', company: 'Roshan Enterprises', slug: 'roshan-enterprises' },
  { title: 'Government tender fulfilment', company: 'Deiyougo Enterprises', slug: 'deiyougo-enterprises' },
  { title: 'Construction material supply', company: 'Roshan Enterprises', slug: 'roshan-enterprises' },
  { title: 'Civil supply tenders', company: 'Kasthamandap Commerce', slug: 'kasthamandap-commerce' },
  { title: 'Commercial procurement sourcing', company: 'Kasthamandap Commerce', slug: 'kasthamandap-commerce' },
  { title: 'Import / export execution', company: 'B & C Exim Company', slug: 'b-c-exim' },
  { title: 'Equipment & tender sourcing', company: 'Deiyougo Enterprises', slug: 'deiyougo-enterprises' },
  { title: 'Foreign bidder support', company: 'Appi Saipal Financial Solutions', slug: 'appi-saipal-financial-solutions' },
]

const workflow = [
  { step: 'Opportunity', desc: 'Identification of viable public or private tenders.' },
  { step: 'Tender review', desc: 'Technical and financial capability assessment.' },
  { step: 'Local partner / JV alignment', desc: 'Structuring compliance and legal representation.' },
  { step: 'Financial & guarantee structure', desc: 'Syndicating required bank guarantees and bonds.' },
  { step: 'Supply / execution planning', desc: 'Logistics and material-sourcing strategy.' },
  { step: 'Bid / tender support', desc: 'Final documentation and submission assistance.' },
  { step: 'Execution support', desc: 'On-the-ground management and supply delivery.' },
]

export default function Procurement() {
  return (
    <div className="bg-canvas min-h-screen">
      <Seo
        title="Procurement & Tender Centre"
        description="Rosid Syndicates Group procurement capabilities in Nepal: public-sector procurement, government tender fulfilment, construction material supply, civil supply tenders, equipment sourcing and import/export execution, plus a seven-step tender support workflow."
        path="/procurement"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Procurement & Tender Centre', path: '/procurement' }]}
      />
      <PageHeader
        title="Procurement & tender centre"
        subtitle="Operations"
        lead="How the group participates in public and private supply tenders, and the support available to bidders."
        image="https://images.unsplash.com/photo-1519003722824-194d4455a60c"
      />

      <section className="py-16 lg:py-24" aria-labelledby="proc-caps">
        <div className="container">
          <h2 id="proc-caps" className="text-h2 max-w-3xl">Core procurement capabilities</h2>
          <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {capabilities.map((cap) => (
              <li key={cap.title} className="card p-6 flex flex-col">
                <h3 className="font-bold text-ink leading-snug flex-1">{cap.title}</h3>
                <Link to={`/companies/${cap.slug}`} className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-accent-text">
                  {cap.company} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-surface border-y border-line" aria-labelledby="bidder-heading">
        <div className="container max-w-5xl">
          <h2 id="bidder-heading" className="text-h2">Foreign bidder support ecosystem</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-8">
            <section className="card p-8" aria-labelledby="fin-g">
              <h3 id="fin-g" className="text-h3 flex items-center gap-3"><span className="font-mono text-sm text-accent-text">01</span> Financial guarantees</h3>
              <p className="mt-3 text-sm text-muted">Secured through Appi Saipal Financial Solutions and Class "A" commercial banks.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink list-disc pl-5">
                <li>Counter-guarantees</li>
                <li>Bid bonds</li>
                <li>Performance bonds</li>
                <li>Advance-payment guarantees</li>
                <li>Financial closure</li>
              </ul>
            </section>
            <section className="card p-8" aria-labelledby="ops-x">
              <h3 id="ops-x" className="text-h3 flex items-center gap-3"><span className="font-mono text-sm text-accent-text">02</span> Operational execution</h3>
              <p className="mt-3 text-sm text-muted">Executed through the group's civil and commerce subsidiaries.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink list-disc pl-5">
                <li>Local representation</li>
                <li>Local JV structuring</li>
                <li>Material supply</li>
                <li>Local logistics</li>
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="workflow-heading">
        <div className="container max-w-4xl">
          <p className="eyebrow">Method</p>
          <h2 id="workflow-heading" className="mt-5 text-h2">Tender support workflow</h2>
          <p className="mt-4 text-lead text-muted">The standard sequence for a supported bid.</p>
          <ol className="mt-10 relative border-l-2 border-line ml-4 space-y-8">
            {workflow.map((item, i) => (
              <li key={item.step} className="relative pl-10">
                <span className="absolute -left-[17px] top-0 grid place-items-center w-8 h-8 rounded-full bg-ink text-white text-xs font-bold font-mono ring-4 ring-canvas" aria-hidden="true">{i + 1}</span>
                <h3 className="text-h3">{item.step}</h3>
                <p className="mt-1.5 text-muted">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-ink text-white" aria-labelledby="proc-cta">
        <div className="container max-w-3xl text-center">
          <h2 id="proc-cta" className="text-h2 text-white">Have a tender in view?</h2>
          <p className="mt-4 text-lead text-slate-300">Send the reference, scope and deadline and the procurement desk will respond.</p>
          <Link to="/tender-inquiry" className="btn-accent mt-8">
            Discuss a tender opportunity <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
